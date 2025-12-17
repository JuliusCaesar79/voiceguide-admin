import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/partners");
      setPartners(res.data || []);
      setError("");
    } catch (err) {
      console.error("Errore caricamento partner:", err);
      setError("Impossibile caricare i partner. Controlla il backend.");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <AdminLayout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          background:
            "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
            colors.card,
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
          border: `1px solid ${colors.borderSoft}`,
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Partner</h1>
          <p
            style={{
              opacity: 0.82,
              fontSize: "0.9rem",
              marginTop: "4px",
              color: colors.textSoft,
            }}
          >
            Elenco partner affiliati al programma VoiceGuide AirLink. Clicca su
            una riga per aprire il dettaglio e registrare i payout.
          </p>
        </div>

        {loading && <p>Caricamento partner...</p>}

        {error && (
          <p
            style={{
              color: colors.dangerSoft,
              fontSize: "0.9rem",
              marginBottom: "10px",
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && partners.length === 0 && (
          <p
            style={{
              opacity: 0.8,
              color: colors.textSoft,
              fontSize: "0.9rem",
            }}
          >
            Nessun partner trovato.
          </p>
        )}

        {!loading && !error && partners.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Commissione %</Th>
                  <Th>Creato</Th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      cursor: "pointer",
                      transition: "background 0.12s ease",
                    }}
                    onClick={() => navigate(`/admin/partners/${p.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(253,197,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Td>{p.id}</Td>
                    <Td>{p.name}</Td>
                    <Td>{p.email}</Td>
                    <Td>{p.commission_pct}%</Td>
                    <Td>{p.created_at}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "8px 10px",
        borderBottom: `1px solid ${colors.borderSoft}`,
        fontWeight: 600,
        fontSize: "0.8rem",
        color: colors.textSoft,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid rgba(30,41,59,0.8)",
        opacity: 0.9,
        color: colors.text,
      }}
    >
      {children}
    </td>
  );
}
