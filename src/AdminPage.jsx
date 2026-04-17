import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./AdminPage.css";

// ─── Supabase client (initialized once, outside the component) ────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);



const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:          #050d1a;
    --surface:     #0a1828;
    --surface2:    #0f2035;
    --surface3:    #162843;
    --border:      rgba(255,255,255,0.06);
    --border-focus:rgba(0,200,232,0.4);
    --cyan:        #00c8e8;
    --yellow:      #ffb703;
    --green:       #00d484;
    --text:        #ddeeff;
    --text-dim:    #8aabbf;
    --muted:       #506880;
    --danger:      #f05070;
    --radius:      12px;
    --radius-lg:   20px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Sora", system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:
      radial-gradient(ellipse 70% 55% at 50% -10%, rgba(0,200,232,0.07), transparent),
      radial-gradient(ellipse 40% 40% at 90% 90%, rgba(0,80,160,0.06), transparent);
  }

  body::before {
    content: "";
    position: fixed; inset: 0;
    background-image: radial-gradient(rgba(0,200,232,0.07) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }

  .page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
  }

  .top-bar {
    width: 100%;
    max-width: 520px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-family: "JetBrains Mono", monospace;
    color: var(--text-dim);
    text-decoration: none;
    cursor: pointer;
    transition: color .2s;
    background: none; border: none;
    letter-spacing: 0.3px;
    padding: 0;
  }
  .back-link:hover { color: var(--cyan); }
  .back-link svg { flex-shrink: 0; }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 5px 14px 5px 8px;
  }
  .user-avatar {
    width: 22px; height: 22px;
    background: linear-gradient(135deg, #0060d0, #00c8e8);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  .user-name { font-size: 13px; color: var(--yellow); }
  .signout-btn {
    background: none; border: none;
    color: var(--text-dim); cursor: pointer;
    font-size: 13px; font-family: "Sora", sans-serif;
    padding: 0; margin-left: 6px;
    transition: color .2s;
    white-space: nowrap;
  }
  .signout-btn:hover { color: var(--danger); }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 36px 40px 40px;
    width: 100%;
    max-width: 520px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,200,232,0.04),
      0 28px 72px rgba(0,0,0,0.55);
    animation: slideUp .45s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 10%, rgba(0,200,232,0.4) 50%, transparent 90%);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .card-icon {
    width: 46px; height: 46px;
    background: linear-gradient(140deg, #0060d0, #00c8e8);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 22px rgba(0,200,232,0.22), inset 0 1px 0 rgba(255,255,255,0.12);
    flex-shrink: 0;
  }
  .card-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: var(--text);
  }
  .card-subtitle {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }

  .step-badge {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: var(--cyan);
    letter-spacing: 1px;
    text-transform: uppercase;
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 100px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  .section-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 1.3px;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .form-fields { display: flex; flex-direction: column; gap: 16px; }

  .form-group { display: flex; flex-direction: column; gap: 7px; }

  .form-group label {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    color: var(--cyan);
    letter-spacing: 1.1px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .label-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--cyan);
    opacity: 0.6;
    display: inline-block;
    flex-shrink: 0;
  }

  .duration-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .select-wrapper { position: relative; }
  .select-wrapper::after {
    content: "";
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--muted);
    pointer-events: none;
  }
  select,
  .form-group input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 11px 14px;
    border-radius: var(--radius);
    font-size: 13.5px;
    font-family: "Sora", sans-serif;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
    appearance: none;
  }
  select { padding-right: 36px; cursor: pointer; }
  select option { background: var(--surface2); color: var(--text); }
  input::placeholder { color: var(--muted); font-size: 13px; }
  select:focus, input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(0,200,232,0.07);
    background: var(--surface3);
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { opacity: 0.3; }

  .form-spacer { height: 8px; }

  .record-button {
    width: 100%;
    background: linear-gradient(135deg, #e8a800, #ffd332);
    border: none;
    padding: 14px;
    border-radius: var(--radius);
    color: #0a1000;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    font-family: "Sora", sans-serif;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 24px rgba(255,183,3,0.28);
    transition: all .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    position: relative;
    overflow: hidden;
  }
  .record-button::before {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
    opacity: 0;
    transition: opacity .2s;
  }
  .record-button:hover:not(:disabled)::before { opacity: 1; }
  .record-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(255,183,3,0.42);
  }
  .record-button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .result {
    margin-top: 14px;
    padding: 11px 14px;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 0;
    transition: all .2s;
  }
  .result:empty { display: none; }
  .result.success {
    background: rgba(0,212,132,0.08);
    border: 1px solid rgba(0,212,132,0.2);
    color: var(--green);
  }
  .result.error {
    background: rgba(240,80,112,0.08);
    border: 1px solid rgba(240,80,112,0.2);
    color: var(--danger);
  }

  .calc-note {
    font-size: 11.5px;
    color: var(--muted);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 13px;
    margin-top: 8px;
    line-height: 1.55;
  }
  .calc-note strong { color: var(--text-dim); }

  @media (max-width: 560px) {
    .card { padding: 28px 22px 32px; }
    .duration-row { grid-template-columns: 1fr; }
    .top-bar { padding: 0 4px; }
  }
`;

export default function AdminPage({ onNavigateToDashboard, onSignOut }) {
  const [zone_name, setZone] = useState("");
  const [rainfall_peak_mm, setRainfallp] = useState("");
  const [rainfall_non_peak_mm, setRainfallnp] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [station_id, setStationId] = useState(null);

  const adminUser = sessionStorage.getItem("admin_user") || "Admin";
  const initials = adminUser.slice(0, 2).toUpperCase();

  const totalRainfall =
    parseFloat(rainfall_peak_mm) * 1.5 +
    parseFloat(rainfall_non_peak_mm);

  useEffect(() => {
    const fetchZones = async () => {
      const { data, error } = await supabase.from("zones").select("*");
      if (!error) setZones(data);
    };
    fetchZones();
  }, []);

  const fetchStationId = async (selectedZone) => {
    const { data, error } = await supabase
      .from("zone_station_map")
      .select("station_id")
      .eq("zone_name", selectedZone)
      .single();
    if (!error) setStationId(data.station_id);
  };

  const handleAddRecord = async () => {
    setMessage("");
    setIsError(false);

    if (!zone_name || !rainfall_peak_mm || !rainfall_non_peak_mm) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    if (parseFloat(rainfall_peak_mm) < 0 || parseFloat(rainfall_non_peak_mm) < 0) {
      setMessage("Values must be non-negative.");
      setIsError(true);
      return;
    }

    if (!station_id) {
      setMessage("Station not found for selected zone.");
      setIsError(true);
      return;
    }

    const peakPayload = {
      zone_name,
      station_id,
      rainfall_mm: parseFloat(rainfall_peak_mm) * 1.5
    };

    const nonPeakPayload = {
      zone_name,
      station_id,
      rainfall_mm: parseFloat(rainfall_non_peak_mm)
    };

    const payload = {
      zone_name,
      station_id,
      rainfall_mm:
        parseFloat(rainfall_peak_mm) * 1.5 +
        parseFloat(rainfall_non_peak_mm)
    };

    setLoading(true);

    try {
      const { error: ePeak } = await supabase
        .from("rainfall_events_peak")
        .insert([peakPayload]);

      const { error: eNonPeak } = await supabase
        .from("rainfall_events_NON_peak")
        .insert([nonPeakPayload]);

      if (ePeak || eNonPeak) {
        setMessage(ePeak?.message || eNonPeak?.message);
        setIsError(true);
        return;
      }

      setMessage("✓ Peak & Non-Peak data inserted successfully!");

      await new Promise(res => setTimeout(res, 1200));

      const { error: eMain } = await supabase
        .from("rainfall_events")
        .insert([payload]);

      if (eMain) {
        setMessage(eMain.message);
        setIsError(true);
        return;
      }

      setMessage("✓ All records inserted successfully!");
      setIsError(false);

      setZone("");
      setRainfallp("");
      setRainfallnp("");

    } catch (err) {
      setMessage(`Unexpected error: ${err.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("admin_authed");
    sessionStorage.removeItem("admin_user");
    if (onSignOut) onSignOut();
    else window.location.href = "AdminLogin.jsx";
  };

  const handleBack = () => {
    if (onNavigateToDashboard) onNavigateToDashboard();
    else window.location.href = "AdminDashboard.jsx";
  };

  const resultClass = "result" + (isError ? " error" : message ? " success" : "");

  return (
    <>
      <style>{styles}</style>
      <div className="page">

        {/* Top bar */}
        <div className="top-bar">
          <button className="back-link" onClick={handleBack}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{adminUser}</span>
            <button className="signout-btn" onClick={handleSignOut}>· Sign out</button>
          </div>
        </div>

        {/* Main card */}
        <main className="card">

          <div className="card-header">
            <div className="header-left">
              <div className="card-icon">🌧️</div>
              <div className="card-title-group">
                <div className="card-title">Simulate Rain Event</div>
                <div className="card-subtitle">Log rainfall data across tables</div>
              </div>
            </div>
            <div className="step-badge">SaaralCareAI</div>
          </div>

          <div className="divider" />

          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="zone_name">
                <span className="label-dot" />
                Zone
              </label>
              <div className="select-wrapper">
                <select
                  id="zone_name"
                  value={zone_name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setZone(v);
                    fetchStationId(v);
                  }}
                >
                  <option value="">Select a zone…</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.zone_name}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />
          <div className="section-label">Rainfall Breakdown</div>

          <div className="duration-row">
            <div className="form-group">
              <label htmlFor="rainfall_peak_mm">
                <span className="label-dot" />
                Peak (mm)
              </label>
              <input
                id="rainfall_peak_mm"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1.5"
                value={rainfall_peak_mm}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || parseFloat(v) >= 0) setRainfallp(v);
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="rainfall_non_peak_mm">
                <span className="label-dot" />
                Non-Peak (mm)
              </label>
              <input
                id="rainfall_non_peak_mm"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 3.0"
                value={rainfall_non_peak_mm}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || parseFloat(v) >= 0) setRainfallnp(v);
                }}
              />
            </div>
          </div>

          <div className="calc-note">
            <strong>Total Rainfall (in mm) = </strong>
            Peak × 1.5 + Non-Peak
          </div>

          <button
            className="record-button"
            type="button"
            onClick={handleAddRecord}
            disabled={loading}
          >
            {loading ? "Saving…" : "Add to Record"}
          </button>

          <div className={resultClass}>{message}</div>

        </main>
      </div>
    </>
  );
}
