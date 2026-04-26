# Voomp — Roadmap de correcciones y escalabilidad

> Documento generado el 18 de abril de 2026.  
> Cubre: resumen de la sesión actual, pendientes técnicos, guía de backend para 10 000 usuarios activos simultáneos y lista de mejoras pendientes detalladas.

---

## 1. Qué se corrigió en esta sesión

| # | Problema | Archivo(s) modificado(s) | Solución aplicada |
|---|----------|--------------------------|-------------------|
| 1 | Modal de bienvenida aparecía en cada visita | `LandingPage.jsx` | Se usa `localStorage` para mostrarlo solo una vez por navegador |
| 2 | `AbortError` en `getSession` dejaba al usuario sin sesión | `AuthContext.jsx` | Se agregó lógica de retry (1 reintento, 800 ms de espera) |
| 3 | App no redirigía a `/home` al iniciar sesión desde la landing | `App.jsx` | Se añadió `else if (page === "landing") navigate("home")` en el efecto de autenticación |
| 4 | El panel de búsqueda del Header persistía al navegar a Mensajes | `Header.jsx` | `useEffect` que resetea `expanded` al cambiar de página |
| 5 | Botón "Dejar reseña" visible para el anfitrión y para conductores sin reservas completadas | `ListingDetailPage.jsx` | Condición `!isOwner && bookings.some(b => b.status === 'completed')` |
| 6 | Formulario inline "Deja tu reseña" visible para cualquier usuario | `ListingDetailPage.jsx` | Misma condición de reserva completada |
| 7 | Total en pantalla de confirmación no incluía la deuda pendiente (`userDebt`) | `BookingConfirmation.jsx` | Fórmula corregida: `subtotal + serviceFee + userDebt` |
| 8 | Columnas `vehicle_name`, `vehicle_plate`, `rejection_reason`, `host_notes`, `updated_at` faltaban en la tabla `bookings` | Migración Supabase | `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS …` |
| 9 | Sin botón para eliminar anuncios en el perfil del anfitrión | `ProfilePage.jsx` | Botón 🗑 con validación: bloquea la eliminación si hay reservas activas o pendientes |
| 10 | Sección "Lo que ofrece este lugar" aparecía vacía cuando no había amenidades | `ListingDetailPage.jsx` | Se envuelve la sección en `{l.amenities?.length > 0 && (…)}` |
| 11 | Formulario de publicación no validaba campos requeridos por paso | `CreateListingPage.jsx` | Botón "Siguiente" se deshabilita hasta completar los campos mínimos del paso actual |
| 12 | `rejectionReason` y `hostNotes` no mapeados al leer reservas | `BookingsContext.jsx` | Agregados a `mapBooking()` |

---

## 2. Pendientes no completados en esta sesión

### 2.1 Foto de Michael Scott en el anuncio de prueba
**Qué hacer:**
1. Iniciar sesión como `clausvdmolen@gmail.com`.
2. Ir a **Perfil → Mis espacios publicados → Editar** en el anuncio "Estacionamiento techado en Santiago Centro".
3. En el paso 3 (Fotos), hacer clic en la zona de fotos para subir una imagen real del espacio.
4. Eliminar la foto actual (botón ✕ sobre la miniatura).
5. Guardar cambios.

### 2.2 Amenidades del anuncio existente vacías
**Qué hacer:**
1. Editar el anuncio (mismo flujo de arriba).
2. En cualquier paso que liste servicios/comodidades (paso 6 o dentro del formulario), marcar los que apliquen: iluminación, cámaras, acceso controlado, etc.
3. Guardar.

### 2.3 Validación de dimensiones y precio en el formulario de creación al usar teclado físico
El `Btn` "Siguiente" ya está deshabilitado cuando los campos están vacíos, pero las entradas `<input type="number">` en React requieren disparar el evento correcto. Si al testear manualmente el botón no se habilita después de tipear, revisar que los inputs usen `onChange` (no solo `onBlur`). Buscar en `CreateListingPage.jsx` todos los `<input` de tipo número y confirmar que tienen `onChange={e => set(…)}`.

### 2.4 Test de check-in / check-out completo
No se pudo completar porque la reserva de prueba es para el 19 de abril a las 12:45. **Cómo probarlo:**
1. Esperar a la fecha/hora de la reserva (o crear una reserva nueva con horario actual).
2. Desde el perfil del anfitrión → "Reservas recibidas" → buscar la reserva en estado "Confirmada".
3. Pulsar "Registrar llegada del conductor" (aparece una ventana de confirmación).
4. Verificar que el estado cambia a "Activa".
5. Pulsar "Registrar salida del conductor" y verificar el estado "Completada".

---

## 3. Mejoras pendientes — lista detallada

A continuación se describen los 7 errores identificados por el equipo, con contexto técnico y pasos para resolverlos.

---

### Mejora 1 — Las secciones del perfil no se actualizan sin recargar la página

**Síntoma:** Al navegar entre pestañas del perfil (Perfil, Mis Voomps guardados, Dashboard) el contenido no refleja los cambios más recientes hasta recargar la página completa.

**Causa probable:** Los contextos `ListingsContext` y `BookingsContext` se cargan una sola vez al montar la app. Si un cambio ocurre (nueva reserva, edición de anuncio) el estado local no se re-sincroniza al volver a visitar una pestaña.

**Solución paso a paso:**

1. **Agregar `fetchListings()` y `fetchBookings()` al enfocar la pestaña del perfil.**  
   En `ProfilePage.jsx`, cerca de la línea 53, agregar:
   ```jsx
   // src/pages/ProfilePage.jsx
   import { useListings } from "../contexts/ListingsContext";
   import { useBookings } from "../contexts/BookingsContext";

   // Dentro del componente:
   const { fetchListings } = useListings();
   const { fetchBookings } = useBookings();

   useEffect(() => {
     fetchListings();
     fetchBookings();
   }, []); // se ejecuta al montar ProfilePage
   ```

2. **Activar las suscripciones Realtime de Supabase en `ListingsContext`.**  
   Actualmente solo `BookingsContext` tiene canal Realtime. Abrir `src/contexts/ListingsContext.jsx` y agregar dentro del `useEffect` principal:
   ```javascript
   const channel = supabase
     .channel('listings-changes')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
       fetchListings(); // refetch completo; en producción mapear el payload directamente
     })
     .on('postgres_changes', { event: '*', schema: 'public', table: 'listing_photos' }, () => {
       fetchListings();
     })
     .subscribe();
   return () => supabase.removeChannel(channel);
   ```

3. **Invalidar la caché del perfil al volver a la app (visibilidad de pestaña).**  
   En `App.jsx` agregar:
   ```javascript
   useEffect(() => {
     const onVisible = () => {
       if (document.visibilityState === 'visible') {
         fetchListings();
         fetchBookings();
       }
     };
     document.addEventListener('visibilitychange', onVisible);
     return () => document.removeEventListener('visibilitychange', onVisible);
   }, []);
   ```

---

### Mejora 2 — Vista de publicación: widget de reserva cae al final en pantallas pequeñas; sección de dimensiones demasiado grande

**Síntoma:** En móviles, al abrir una publicación el panel de "Reservar" aparece muy abajo porque la sección de dimensiones ocupa demasiado espacio. Las reseñas deberían estar al final.

**Solución paso a paso:**

1. **Mover la sección "Reseñas" al final** en `ListingDetailPage.jsx`:
   - Buscar el bloque `{/* Reviews */}` (línea ~647) y cortar todo el bloque hasta su `</div>` de cierre.
   - Pegarlo **después** de `{/* Rules */}` (línea ~691), es decir, como último bloque antes del cierre del contenedor principal.

2. **Reducir el tamaño visual de la sección de dimensiones.**  
   Buscar `{/* Dimensions */}` (~línea 595) y ajustar el grid:
   ```jsx
   // Cambiar de 3 columnas grandes a una fila compacta horizontal
   <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 8 }}>
     <span style={{ fontSize: 14, color: "#555" }}>
       <strong>{l.dimensions?.width}m</strong> ancho &nbsp;·&nbsp;
       <strong>{l.dimensions?.length}m</strong> largo
       {l.dimensions?.height && <> &nbsp;·&nbsp; <strong>{l.dimensions.height}m</strong> alto</>}
     </span>
   </div>
   ```
   Eliminar las cajas individuales con bordes y padding que hacen la sección tan alta.

3. **Asegurar que el widget de reserva aparezca en la parte superior en escritorio** (ya está sticky, pero en móvil se renderiza al final del DOM). La solución más limpia es cambiar el orden en móvil usando CSS:
   ```jsx
   // En el contenedor padre de dos columnas:
   style={{ display: "flex", flexDirection: "column-reverse", /* en móvil widget arriba */ }}
   // Y en breakpoint desktop:
   "@media (min-width: 768px)": { flexDirection: "row" }
   ```
   Como el proyecto usa estilos inline, usar un hook `useWindowWidth` para conmutar el orden condicionalmente.

---

### Mejora 3 — Agregar sección "Mis movimientos" con historial de saldos

**Síntoma:** El usuario no tiene un lugar claro donde ver su historial financiero: deudas, créditos a favor, cobros de comisión, multas.

**Solución paso a paso:**

1. **Agregar la pestaña al perfil** en `ProfilePage.jsx`:
   ```jsx
   // En el array/lista de pestañas del perfil, agregar:
   { key: "movimientos", label: "Mis movimientos" }
   ```

2. **Crear la tabla `wallet_transactions` en Supabase** para persistir cada movimiento:
   ```sql
   CREATE TABLE wallet_transactions (
     id          bigserial PRIMARY KEY,
     user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
     booking_id  bigint REFERENCES bookings(id) ON DELETE SET NULL,
     type        text NOT NULL, -- 'credit', 'debit', 'commission', 'penalty', 'refund'
     amount      integer NOT NULL, -- en CLP, positivo = a favor del usuario
     description text,
     created_at  timestamptz DEFAULT now()
   );
   ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "own transactions" ON wallet_transactions
     FOR ALL USING (user_id = auth.uid());
   ```

3. **Crear un trigger de Postgres** que inserte un registro en `wallet_transactions` cada vez que `profiles.credit` cambie:
   ```sql
   CREATE OR REPLACE FUNCTION log_credit_change()
   RETURNS TRIGGER LANGUAGE plpgsql AS $$
   BEGIN
     IF NEW.credit IS DISTINCT FROM OLD.credit THEN
       INSERT INTO wallet_transactions(user_id, amount, description)
       VALUES (NEW.id, OLD.credit - NEW.credit, 'Ajuste de saldo');
     END IF;
     RETURN NEW;
   END;
   $$;
   CREATE TRIGGER on_credit_change
     AFTER UPDATE OF credit ON profiles
     FOR EACH ROW EXECUTE FUNCTION log_credit_change();
   ```

4. **Crear `WalletPanel.jsx`** en `src/components/` que consulte `wallet_transactions` y muestre:
   - Saldo actual (positivo = deuda, negativo = crédito a favor).
   - Lista cronológica de movimientos con tipo, monto y descripción.
   - Badge de color: rojo para deudas, verde para créditos.

5. **Renderizar el panel** dentro del `case "movimientos"` en `ProfilePage.jsx`.

---

### Mejora 4 — Reservas mensuales: mostrar fecha de término en el detalle del anfitrión

**Síntoma:** Cuando llega una reserva mensual, el anfitrión no puede ver cuándo termina el contrato.

**Solución:**

En `ProfilePage.jsx`, dentro del bloque de renderizado de reservas recibidas (~línea 749), después de la línea que muestra `monthlyStartDate`, agregar:

```jsx
{b.priceUnit === "mes" && b.monthlyEndMonth && (
  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
    Hasta fin de {new Date(b.monthlyEndMonth + "-01").toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
  </div>
)}
{b.priceUnit === "mes" && !b.monthlyEndMonth && b.endDate && (
  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
    Fecha de término: {new Date(b.endDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
  </div>
)}
```

Asegurarse de que el campo `monthly_end_month` esté en la tabla `bookings`. Si no existe, agregar:
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS monthly_end_month text; -- formato YYYY-MM
```
Y añadirlo a `mapBooking()` en `BookingsContext.jsx`:
```javascript
monthlyEndMonth: b.monthly_end_month ?? null,
```

---

### Mejora 5 — Pop-up con QR al hacer check-in y check-out

**Síntoma:** Al registrar la llegada o salida del conductor no hay ninguna confirmación visual ni comprobante.

**Solución paso a paso:**

1. **Instalar la librería de QR:**
   ```bash
   npm install qrcode.react
   ```

2. **Crear `CheckInModal.jsx`** en `src/components/`:
   ```jsx
   import { QRCodeSVG } from "qrcode.react";
   import { formatCLP } from "../utils/format";

   export default function CheckInModal({ booking, type, onClose }) {
     // type: "checkin" | "checkout"
     const qrData = JSON.stringify({
       ref: booking.bookingRef,
       listing: booking.listingTitle,
       conductor: booking.conductorName,
       [type === "checkin" ? "checkedIn" : "checkedOut"]: new Date().toISOString(),
     });

     return (
       <div style={{ textAlign: "center", padding: 24 }}>
         <h2>{type === "checkin" ? "✅ Check-in registrado" : "🏁 Check-out registrado"}</h2>
         <QRCodeSVG value={qrData} size={200} style={{ margin: "24px auto", display: "block" }} />
         <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 16, textAlign: "left", marginTop: 16 }}>
           <p><strong>Ref:</strong> {booking.bookingRef}</p>
           <p><strong>Espacio:</strong> {booking.listingTitle}</p>
           <p><strong>Conductor:</strong> {booking.conductorName}</p>
           <p><strong>Horario:</strong> {booking.startTime} — {booking.endTime}</p>
           <p><strong>Total:</strong> {formatCLP(booking.total)}</p>
         </div>
         <button onClick={onClose} style={{ marginTop: 24, padding: "12px 32px", borderRadius: 8,
           background: "#e91e63", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
           Cerrar
         </button>
       </div>
     );
   }
   ```

3. **Integrar el modal en `ProfilePage.jsx`:**
   ```jsx
   const [checkModal, setCheckModal] = useState(null); // { booking, type }

   // Al hacer check-in (reemplazar el alert actual):
   await checkIn(b.id);
   setCheckModal({ booking: b, type: "checkin" });

   // Al hacer check-out:
   await checkOut(b.id);
   setCheckModal({ booking: b, type: "checkout" });

   // En el render:
   {checkModal && (
     <Modal open onClose={() => setCheckModal(null)} title="">
       <CheckInModal booking={checkModal.booking} type={checkModal.type} onClose={() => setCheckModal(null)} />
     </Modal>
   )}
   ```

---

### Mejora 6 — Cambiar la comisión al 20% (10% conductor + 10% anfitrión)

**Síntoma:** La comisión actual es del 5% (solo al conductor). El modelo de negocio requiere 20% total: 10% cobrado al conductor y 10% descontado al anfitrión.

**Archivos a modificar:**

1. **`BookingConfirmation.jsx`** — tarifa que ve el conductor:
   ```javascript
   // Buscar la línea:
   const serviceFee = Math.round(subtotal * 0.05);
   // Cambiar a:
   const serviceFee = Math.round(subtotal * 0.10); // 10% comisión conductor
   ```

2. **`ProfilePage.jsx`** — lo que recibe el anfitrión:
   - Buscar donde se calcula el pago al anfitrión (función `handleApprove` o similar).
   - Asegurarse de que al aprobar una reserva el monto neto para el anfitrión sea `total * 0.90`.

3. **Trigger de Postgres `on_booking_approved`** en Supabase — ajustar el descuento:
   ```sql
   -- Editar el trigger existente para que descuente 10% al host payout
   -- y cobre 10% adicional al conductor en el total
   ```
   Consultar el trigger actual con:
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'on_booking_approved';
   ```
   Luego actualizar la lógica de crédito/débito para reflejar el 10% de cada lado.

4. **Actualizar todos los textos** que digan "Tarifa de servicio (5%)" a "Tarifa de servicio (10%)":
   ```bash
   grep -r "5%" src/ --include="*.jsx" --include="*.js"
   ```

---

### Mejora 7 — Extensión de estadía: cobrar comisión sobre el monto extendido; acortamiento: solo reintegrar el abono sin devolver comisión

**Síntoma:** El sistema de modificación de reservas no aplica correctamente la comisión cuando se extiende el tiempo.

**Solución paso a paso:**

1. **En `BookingsContext.jsx` — función `proposeModification`** (o la que gestiona extensiones):
   - Calcular el delta de tiempo: `deltaTotalExtra = newTotal - originalTotal`.
   - Si `deltaTotalExtra > 0` (extensión), cobrar comisión sobre el delta:
     ```javascript
     const extensionFee = Math.round(deltaTotalExtra * 0.10); // 10% conductor
     // Agregar extensionFee al total que se cobra al conductor
     ```
   - Si `deltaTotalExtra < 0` (acortamiento), reintegrar solo `|delta| * 0.90` (sin devolver comisión):
     ```javascript
     const refundAmount = Math.round(Math.abs(deltaTotalExtra) * 0.90);
     // Aplicar como crédito negativo en profiles.credit
     ```

2. **Crear trigger `on_booking_modified`** en Supabase que automatice esto server-side:
   ```sql
   CREATE OR REPLACE FUNCTION handle_booking_modification()
   RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
   DECLARE
     delta int;
     conductor_credit int;
   BEGIN
     IF NEW.mod_status = 'approved' AND NEW.mod_new_total IS NOT NULL THEN
       delta := NEW.mod_new_total - COALESCE(OLD.total, 0);
       IF delta > 0 THEN
         -- Extensión: cobrar comisión del 10% sobre el delta
         conductor_credit := delta + ROUND(delta * 0.10);
         UPDATE profiles SET credit = credit + conductor_credit WHERE id = NEW.conductor_id;
       ELSIF delta < 0 THEN
         -- Acortamiento: reintegrar 90% del delta (sin devolver comisión)
         conductor_credit := ROUND(ABS(delta) * 0.90);
         UPDATE profiles SET credit = credit - conductor_credit WHERE id = NEW.conductor_id;
       END IF;
       -- Actualizar el total de la reserva
       NEW.total := NEW.mod_new_total;
     END IF;
     RETURN NEW;
   END;
   $$;

   CREATE TRIGGER on_booking_modified
     BEFORE UPDATE OF mod_status ON bookings
     FOR EACH ROW
     WHEN (NEW.mod_status = 'approved')
     EXECUTE FUNCTION handle_booking_modification();
   ```

3. **En la UI** (`ProfilePage.jsx`, sección de modificaciones aprobadas), mostrar claramente el desglose:
   - Monto original de la reserva.
   - Delta (extensión o reducción).
   - Comisión aplicada sobre el delta (si es extensión).
   - Monto neto reintegrado (si es acortamiento).

---

## 4. Guía de escalabilidad: soporte para 10 000 usuarios activos simultáneos

### 4.1 Estado actual y límites

| Componente | Estado actual | Límite aproximado |
|------------|--------------|-------------------|
| Supabase (plan Pro) | PostgreSQL compartido | ~500 conexiones simultáneas |
| Supabase Realtime | Sin límite de canales definido | ~1 000 conexiones WS en plan Pro |
| Vercel (frontend) | CDN global, funciones Edge | Sin límite práctico para archivos estáticos |
| Supabase Storage | Sin caché CDN personalizada | Latencia variable en regiones remotas |

Para 10 000 usuarios activos simultáneos se necesitan los siguientes cambios.

---

### 4.2 Base de datos — PostgreSQL en Supabase

#### Paso 1: Subir al plan Supabase Team o Enterprise
- Team plan: hasta 1 500 conexiones directas + PgBouncer incluido.
- Activar **PgBouncer en modo Transaction** desde el dashboard de Supabase → Settings → Database → Connection Pooling.
  - `Pool size`: 200 por instancia.
  - Modo: `Transaction` (no Session, ya que las Edge Functions son stateless).

#### Paso 2: Índices críticos
Ejecutar en el SQL Editor de Supabase:
```sql
-- Reservas por conductor y anfitrión (consultas más frecuentes)
CREATE INDEX IF NOT EXISTS idx_bookings_conductor ON bookings(conductor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host_id, status, created_at DESC);

-- Anuncios por anfitrión
CREATE INDEX IF NOT EXISTS idx_listings_host ON listings(host_id, created_at DESC);

-- Fotos por anuncio
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON listing_photos(listing_id, position);

-- Mensajes por conversación
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);

-- Wallet transactions por usuario
CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id, created_at DESC);
```

#### Paso 3: Paginación en todas las queries
Reemplazar `SELECT *` sin límite por queries paginadas:
```javascript
// BookingsContext.jsx — fetchBookings
const { data } = await supabase
  .from('bookings')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 49); // máximo 50 por fetch, paginar con botón "cargar más"
```

#### Paso 4: Particionado de tabla de mensajes (cuando supere 10M filas)
```sql
-- Para cuando la tabla messages sea grande:
ALTER TABLE messages RENAME TO messages_old;
CREATE TABLE messages (LIKE messages_old INCLUDING ALL) PARTITION BY RANGE (created_at);
CREATE TABLE messages_2026 PARTITION OF messages FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
-- etc.
```

---

### 4.3 Supabase Realtime — gestión de conexiones WebSocket

Con 10 000 usuarios simultáneos, cada uno abrirá 2–4 canales WebSocket. El plan Pro soporta hasta 200 conexiones Realtime simultáneas por defecto.

#### Paso 1: Consolidar canales
En lugar de un canal por tabla por usuario, usar un solo canal por usuario:
```javascript
// BookingsContext.jsx — reemplazar los dos .on() separados por uno consolidado
const channel = supabase
  .channel(`user-${user.id}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings',
      filter: `conductor_id=eq.${user.id}` }, handleChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings',
      filter: `host_id=eq.${user.id}` }, handleChange)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles',
      filter: `id=eq.${user.id}` }, handleProfileChange)
  .subscribe();
```

#### Paso 2: Desconectar cuando la pestaña no está visible
```javascript
// En App.jsx o en cada Context
document.addEventListener('visibilitychange', () => {
  if (document.hidden) supabase.removeAllChannels();
  else reconnectChannels(); // re-suscribir
});
```

#### Paso 3: Upgrade a Supabase Enterprise Realtime
El plan Enterprise soporta hasta 10 000 conexiones Realtime concurrentes. Contactar a Supabase para el plan Enterprise o usar **Supabase Realtime Multiplayer** con particionado de canales por región.

---

### 4.4 Frontend — Vercel CDN y caché

#### Paso 1: Cachear la respuesta inicial de listings
Crear una Vercel Edge Function que sirva los anuncios populares como JSON estático cacheado:
```
/api/listings/featured → cache 60 segundos en el edge
```
Así los primeros 10 000 usuarios que abran la app no golpean Supabase directamente.

#### Paso 2: Activar `stale-while-revalidate` en llamadas a Supabase
```javascript
// ListingsContext.jsx
const fetchListings = async () => {
  // Mostrar datos de caché local inmediatamente
  const cached = sessionStorage.getItem('listings_cache');
  if (cached) setListings(JSON.parse(cached));

  // Luego actualizar en segundo plano
  const { data } = await supabase.from('listings').select('*,listing_photos(*)').order('created_at', { ascending: false });
  if (data) {
    setListings(data.map(mapListing));
    sessionStorage.setItem('listings_cache', JSON.stringify(data.map(mapListing)));
  }
};
```

#### Paso 3: Lazy loading de imágenes
En `ListingCard.jsx` y `PhotoGallery.jsx`, asegurarse de que todas las `<img>` tengan `loading="lazy"`:
```jsx
<img src={url} loading="lazy" alt="" />
```

#### Paso 4: Code splitting
En `App.jsx`, usar React.lazy para cargar páginas bajo demanda:
```javascript
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CreateListingPage = React.lazy(() => import('./pages/CreateListingPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
```

---

### 4.5 Supabase Storage — imágenes de anuncios

Con 10 000 usuarios el volumen de imágenes crecerá rápidamente. Configurar un CDN externo:

#### Opción A (recomendada): Cloudflare Images
1. Registrarse en Cloudflare Images.
2. Al subir fotos en `App.jsx → handlePublish`, hacer `POST` a la API de Cloudflare en vez de a Supabase Storage.
3. Guardar la URL de Cloudflare en `listing_photos.url`.
4. Cloudflare sirve las imágenes con optimización automática (WebP, resize, caché global).

#### Opción B: Supabase Storage con transformaciones
Activar **Image Transformations** en Supabase (plan Pro):
```javascript
const { data: { publicUrl } } = supabase.storage
  .from('listing-photos')
  .getPublicUrl(path, {
    transform: { width: 800, quality: 80, format: 'webp' }
  });
```

---

### 4.6 Autenticación a escala

Con muchos usuarios concurrentes, las sesiones de Supabase Auth pueden generar carga en la tabla `auth.sessions`.

1. **Reducir el TTL del access token** a 1 hora (ya es el default).
2. **Activar `autoRefreshToken: false`** en clientes de solo lectura (mapas, listados públicos).
3. **Configurar Rate Limiting** en Supabase Auth → Settings → Rate Limits:
   - Sign-up: 10/hora por IP.
   - Sign-in: 30/hora por IP.
   - OTP: 5/hora por email.

---

### 4.7 Monitoreo y alertas

| Herramienta | Qué monitorear | Umbral de alerta |
|-------------|----------------|-----------------|
| Supabase Dashboard → Reports | DB connections, query latency | > 300 conexiones o > 500ms p95 |
| Vercel Analytics | Core Web Vitals, errores 5xx | LCP > 2.5s o error rate > 1% |
| Sentry (instalar) | Errores de JavaScript en producción | Cualquier error nuevo |
| Uptime Robot | `https://myvoomp.com` disponibilidad | Caída > 30 segundos |

**Instalar Sentry:**
```bash
npm install @sentry/react
```
```javascript
// main.jsx
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "TU_DSN_AQUI", tracesSampleRate: 0.1 });
```

---

### 4.8 Checklist de escalabilidad — orden de prioridad

| Prioridad | Acción | Impacto | Esfuerzo |
|-----------|--------|---------|----------|
| 🔴 Alta | Activar PgBouncer en Supabase | Soportar 10× más conexiones DB | Bajo (1 clic) |
| 🔴 Alta | Crear índices en `bookings` y `listings` | Queries 10-50× más rápidas | Bajo (SQL) |
| 🔴 Alta | Paginación en todas las queries | Evitar timeouts con datos masivos | Medio |
| 🟡 Media | Consolidar canales Realtime | Reducir conexiones WS 4× | Medio |
| 🟡 Media | Caché local con `sessionStorage` | Eliminar latencia percibida | Bajo |
| 🟡 Media | `loading="lazy"` en imágenes | Reducir LCP y ancho de banda | Bajo |
| 🟡 Media | Instalar Sentry | Visibilidad de errores en producción | Bajo |
| 🟢 Baja | Code splitting con React.lazy | Bundle inicial 30-40% más pequeño | Medio |
| 🟢 Baja | Cloudflare Images | Imágenes optimizadas globalmente | Alto |
| 🟢 Baja | Supabase Enterprise | Realtime para > 5 000 usuarios | Alto (costo) |

---

*Fin del documento. Actualizar cuando se completen las mejoras.*
