import { useEffect, useState } from "react";
import "./App.css";

const SSE_URL = "http://localhost:3000/api/sse/desktop";

function App() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    // Generate a stable hostname for this instance
    const name = `Desktop-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setHostname(name);

    const es = new EventSource(
      `${SSE_URL}?hostname=${encodeURIComponent(name)}`,
    );

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "block") {
          setIsBlocked(true);
        }
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => es.close();
  }, []);

  if (isBlocked) {
    return (
      <div className="blocked-screen">
        <div className="blocked-glow" />
        <div className="blocked-content">
          <div className="blocked-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="blocked-title">BLOCKED</h1>
          <p className="blocked-subtitle">
            This device has been locked by the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="connected-screen">
      <div className="connected-content">
        <div className={`pulse-ring ${connected ? "active" : ""}`}>
          <div className="pulse-core" />
        </div>
        <h1 className="app-title">{hostname || "Desktop Client"}</h1>
        <p className="app-status">
          {connected ? (
            <>
              <span className="status-indicator online" />
              Connected to Command Center
            </>
          ) : (
            <>
              <span className="status-indicator" />
              Connecting…
            </>
          )}
        </p>
        <div className="info-card">
          <span className="info-label">SSE Endpoint</span>
          <code className="info-value">localhost:3000</code>
        </div>
      </div>
    </div>
  );
}

export default App;
