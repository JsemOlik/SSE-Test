"use client";

import { useEffect, useState } from "react";

interface ConnectedClient {
  hostname: string;
  connectedAt: number;
}

export default function Home() {
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockFlash, setBlockFlash] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/sse/web");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "clients") {
          setClients(data.clients);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => es.close();
  }, []);

  async function handleBlock() {
    setIsBlocking(true);
    try {
      await fetch("/api/block", { method: "POST" });
      setBlockFlash(true);
      setTimeout(() => setBlockFlash(false), 600);
    } finally {
      setIsBlocking(false);
    }
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString();
  }

  return (
    <div className="dashboard">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <header className="dashboard-header">
        <div className="logo-area">
          <div className="logo-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <h1>Command Center</h1>
        </div>
        <div className="status-badge">
          <span
            className={`status-dot ${clients.length > 0 ? "online" : ""}`}
          />
          {clients.length} device{clients.length !== 1 ? "s" : ""} connected
        </div>
      </header>

      <main className="dashboard-main">
        <section className="panel devices-panel">
          <div className="panel-header">
            <h2>Connected Devices</h2>
            <span className="device-count">{clients.length}</span>
          </div>
          <div className="device-list">
            {clients.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <p>No devices connected</p>
                <span className="empty-hint">
                  Start a desktop app to see it here
                </span>
              </div>
            ) : (
              clients.map((c, i) => (
                <div
                  key={`${c.hostname}-${c.connectedAt}`}
                  className="device-card"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="device-icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="device-info">
                    <span className="device-name">{c.hostname}</span>
                    <span className="device-time">
                      Connected at {formatTime(c.connectedAt)}
                    </span>
                  </div>
                  <span className="device-status-dot" />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel action-panel">
          <div className="panel-header">
            <h2>Actions</h2>
          </div>
          <div className="action-area">
            <p className="action-desc">
              Send a <strong>Block</strong> instruction to all connected desktop
              applications. This will lock every connected device instantly.
            </p>
            <button
              id="block-button"
              className={`block-btn ${blockFlash ? "flash" : ""}`}
              onClick={handleBlock}
              disabled={isBlocking || clients.length === 0}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isBlocking ? "Sending…" : "Block All Devices"}
            </button>
            {clients.length === 0 && (
              <span className="action-hint">Connect a device first</span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
