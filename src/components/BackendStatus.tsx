
import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api";

type ConnectionStatus = "checking" | "connected" | "disconnected";

export default function BackendStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    let active = true;

    async function checkConnection() {
      try {
        await checkBackendHealth();

        if (active) {
          setStatus("connected");
        }
      } catch {
        if (active) {
          setStatus("disconnected");
        }
      }
    }

    void checkConnection();

    const interval = window.setInterval(
      () => void checkConnection(),
      5000,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const statusInfo = {
    checking: {
      label: "Checking backend...",
      color: "#eab308",
    },
    connected: {
      label: "AI backend connected",
      color: "#22c55e",
    },
    disconnected: {
      label: "Backend offline",
      color: "#ef4444",
    },
  }[status];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        border: "1px solid #30303e",
        borderRadius: "10px",
        background: "#15151f",
        color: "#e9eaf3",
        fontSize: "12px",
      }}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: statusInfo.color,
        }}
      />
      {statusInfo.label}
    </div>
  );
}
