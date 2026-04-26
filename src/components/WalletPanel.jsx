import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { formatCLP } from "../utils/format";
import { BRAND_COLOR } from "../constants";
import { useLang } from "../contexts/LangContext";

export default function WalletPanel({ user }) {
  const { t } = useLang();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const credit = Number(user?.credit) || 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setLoading(false); return; }
      setLoading(true);
      const { data, error: qErr } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (qErr) { setError(qErr.message); setTxs([]); }
      else { setTxs(data || []); setError(null); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t("wallet.title")}</h2>

      <div style={{
        padding: 20, borderRadius: 12, marginBottom: 24,
        background: credit > 0 ? "#fef2f2" : credit < 0 ? "#ecfdf5" : "#f7f7f7",
        border: `1px solid ${credit > 0 ? "#fca5a5" : credit < 0 ? "#86efac" : "#eee"}`,
      }}>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
          {credit > 0 ? t("wallet.pending") : credit < 0 ? t("wallet.credit") : t("wallet.balance")}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700,
          color: credit > 0 ? "#b91c1c" : credit < 0 ? "#065f46" : "#222",
        }}>
          {formatCLP(Math.abs(credit))}
        </div>
      </div>

      {loading && <div style={{ color: "#555" }}>{t("wallet.loading")}</div>}
      {error && <div style={{ color: "#b91c1c", fontSize: 14 }}>
        {t("wallet.error")} ({error}). Ejecuta la migración <code>wallet_transactions</code> en Supabase.
      </div>}

      {!loading && !error && txs.length === 0 && (
        <div style={{ color: "#555", fontSize: 14 }}>{t("wallet.noTxs")}</div>
      )}

      {!loading && txs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {txs.map(tx => {
            const amount = Number(tx.amount) || 0;
            const isPositive = amount > 0;
            return (
              <div key={tx.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: 14, background: "#fff", border: "1px solid #eee", borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {t(`wallet.type_${tx.type}`) !== `wallet.type_${tx.type}` ? t(`wallet.type_${tx.type}`) : (tx.type || t("wallet.movement"))}
                  </div>
                  {tx.description && (
                    <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{tx.description}</div>
                  )}
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                    {new Date(tx.created_at).toLocaleString("es-CL")}
                  </div>
                </div>
                <div style={{
                  fontWeight: 700, fontSize: 15,
                  color: isPositive ? "#065f46" : "#b91c1c",
                }}>
                  {isPositive ? "+" : "−"}{formatCLP(Math.abs(amount))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 12, color: "#888", textAlign: "center" }}>
        {t("wallet.footerNote")}
      </div>
    </div>
  );
}
