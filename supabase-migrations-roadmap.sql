-- =====================================================================
-- Voomp — Migraciones del Roadmap (2026-04-18)
-- Ejecuta este archivo en el SQL Editor de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Mejora 4: columna monthly_end_month en bookings
-- ---------------------------------------------------------------------
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS monthly_end_month text; -- 'YYYY-MM'

-- ---------------------------------------------------------------------
-- Mejora 3: wallet_transactions + trigger de auditoría sobre profiles.credit
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id  bigint REFERENCES bookings(id) ON DELETE SET NULL,
  type        text NOT NULL,   -- 'credit','debit','commission','penalty','refund'
  amount      integer NOT NULL,-- CLP, positivo = a favor del usuario, negativo = cargo
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own transactions" ON wallet_transactions;
CREATE POLICY "own transactions" ON wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION log_credit_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.credit IS DISTINCT FROM OLD.credit THEN
    INSERT INTO wallet_transactions(user_id, amount, description, type)
    VALUES (
      NEW.id,
      OLD.credit - NEW.credit, -- bajar deuda = positivo (crédito en la tx)
      'Ajuste de saldo',
      CASE WHEN NEW.credit > OLD.credit THEN 'debit' ELSE 'credit' END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_credit_change ON profiles;
CREATE TRIGGER on_credit_change
  AFTER UPDATE OF credit ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_credit_change();

-- ---------------------------------------------------------------------
-- Mejora 7: handle_booking_modification (comisión sobre delta)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_booking_modification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  delta int;
  conductor_credit int;
BEGIN
  IF NEW.mod_status = 'approved' AND NEW.mod_new_total IS NOT NULL THEN
    delta := NEW.mod_new_total - COALESCE(OLD.total, 0);
    IF delta > 0 THEN
      -- Extensión: cobra 10% comisión sobre el delta → debe delta + 10%
      conductor_credit := delta + ROUND(delta * 0.10);
      UPDATE profiles SET credit = credit + conductor_credit WHERE id = NEW.conductor_id;
    ELSIF delta < 0 THEN
      -- Acortamiento: reintegra 90% del |delta| (no devuelve comisión)
      conductor_credit := ROUND(ABS(delta) * 0.90);
      UPDATE profiles SET credit = credit - conductor_credit WHERE id = NEW.conductor_id;
    END IF;
    NEW.total := NEW.mod_new_total;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_modified ON bookings;
CREATE TRIGGER on_booking_modified
  BEFORE UPDATE OF mod_status ON bookings
  FOR EACH ROW
  WHEN (NEW.mod_status = 'approved')
  EXECUTE FUNCTION handle_booking_modification();

-- ---------------------------------------------------------------------
-- Mejora 6: ajustar trigger on_booking_approved a 10% comisión (ambos lados)
-- ---------------------------------------------------------------------
-- Revisa el trigger actual antes de ejecutar:
--   SELECT prosrc FROM pg_proc WHERE proname = 'on_booking_approved';
-- Luego adapta la función para que:
--   - Cobre 10% al conductor (en lugar de 5%)
--   - Descuente 10% al payout del anfitrión
-- La lógica específica depende de tu función actual.

-- ---------------------------------------------------------------------
-- Sección 4.2: índices críticos para 10k usuarios concurrentes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_conductor ON bookings(conductor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_host      ON bookings(host_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_host      ON listings(host_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON listing_photos(listing_id, position);
CREATE INDEX IF NOT EXISTS idx_wallet_user        ON wallet_transactions(user_id, created_at DESC);
-- Mensajes: ajusta el nombre de tabla/columna si difiere
-- CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
