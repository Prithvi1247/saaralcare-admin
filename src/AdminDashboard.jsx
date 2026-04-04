import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./admin.css";

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
  );

// ── Zone Line Graph: Workers per Zone ─────────────────────────────────────────
function ZoneLineGraph({ data }) {
  const [hov, setHov] = useState(null);
  const W = 480, H = 110;
  const PAD = { top: 12, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxV = Math.max(...data.map(d => d.workers));
  const minV = Math.min(...data.map(d => d.workers));
  const xScale = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.workers)}`).join(" ");
  const area = [
    `M${xScale(0)},${PAD.top + innerH}`,
    ...data.map((d, i) => `L${xScale(i)},${yScale(d.workers)}`),
    `L${xScale(data.length - 1)},${PAD.top + innerH}`,
    "Z",
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00c8e8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00c8e8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((t, i) => (
        <line key={i}
          x1={PAD.left} x2={W - PAD.right}
          y1={PAD.top + innerH * (1 - t)} y2={PAD.top + innerH * (1 - t)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}

      <path d={area} fill="url(#lineGrad)" />
      <polyline points={pts} fill="none" stroke="#00c8e8" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "default" }}>
          <circle
            cx={xScale(i)} cy={yScale(d.workers)}
            r={hov === i ? 6 : 4}
            fill={hov === i ? "#fff" : "#00c8e8"}
            stroke="#00c8e8" strokeWidth="2"
          />
          <text
            x={xScale(i)} y={H - 4}
            textAnchor="middle" fontSize="8"
            transform={`rotate(-20 ${xScale(i)} ${H - 4})`}
            fill="#6b8aac">
            {d.zone}
          </text>
          {hov === i && (
            <g>
              <rect x={xScale(i) - 26} y={yScale(d.workers) - 26} width="52" height="18" rx="5"
                fill="#122843" stroke="rgba(255,255,255,0.12)" />
              <text x={xScale(i)} y={yScale(d.workers) - 13} textAnchor="middle"
                fontSize="9" fill="#e8f0ff" fontWeight="700">
                {d.workers} workers
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Dual-Line Graph: Premium vs Claims per Zone ───────────────────────────────
function DualLineGraph({ data }) {
  const [hov, setHov] = useState(null); // { i, line: 'premium' | 'claims' }
  const W = 340, H = 150;
  const PAD = { top: 16, right: 14, bottom: 32, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = [...data.map(d => d.premium), ...data.map(d => d.claims)];
  const maxV = Math.max(...allVals);
  const minV = 0;

  const xScale = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  const premiumPts = data.map((d, i) => `${xScale(i)},${yScale(d.premium)}`).join(" ");
  const claimsPts  = data.map((d, i) => `${xScale(i)},${yScale(d.claims)}`).join(" ");

  const premiumArea = [
    `M${xScale(0)},${PAD.top + innerH}`,
    ...data.map((d, i) => `L${xScale(i)},${yScale(d.premium)}`),
    `L${xScale(data.length - 1)},${PAD.top + innerH}`, "Z",
  ].join(" ");

  const claimsArea = [
    `M${xScale(0)},${PAD.top + innerH}`,
    ...data.map((d, i) => `L${xScale(i)},${yScale(d.claims)}`),
    `L${xScale(data.length - 1)},${PAD.top + innerH}`, "Z",
  ].join(" ");

  const yTicks = [0, maxV * 0.5, maxV].map(v => ({
    v,
    y: yScale(v),
    label: v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`,
  }));

  const isHov = (i, line) => hov && hov.i === i && hov.line === line;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00d484" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#00d484" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="claimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffb703" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={PAD.left - 5} y={t.y + 3.5} textAnchor="end"
            fontSize="8" fill="#6b8aac">{t.label}</text>
        </g>
      ))}

      {/* Area fills */}
      <path d={premiumArea} fill="url(#premGrad)" />
      <path d={claimsArea}  fill="url(#claimGrad)" />

      {/* Lines */}
      <polyline points={premiumPts} fill="none" stroke="#00d484" strokeWidth="2.2"
        strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={claimsPts}  fill="none" stroke="#ffb703" strokeWidth="2.2"
        strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={xScale(i)} y={H - 4}
          textAnchor="middle" fontSize="8"
          transform={`rotate(-20 ${xScale(i)} ${H - 4})`}
          fill="#6b8aac">
          {d.zone}
        </text>
      ))}

      {/* Premium dots + tooltips */}
      {data.map((d, i) => (
        <g key={`p${i}`}
          onMouseEnter={() => setHov({ i, line: "premium" })}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "default" }}>
          <circle
            cx={xScale(i)} cy={yScale(d.premium)}
            r={isHov(i, "premium") ? 5.5 : 3.5}
            fill={isHov(i, "premium") ? "#fff" : "#00d484"}
            stroke="#00d484" strokeWidth="2"
          />
          {isHov(i, "premium") && (
            <g>
              <rect x={xScale(i) - 32} y={yScale(d.premium) - 30} width="64" height="18" rx="4"
                fill="#0d1f35" stroke="rgba(0,212,132,0.4)" />
              <text x={xScale(i)} y={yScale(d.premium) - 17} textAnchor="middle"
                fontSize="8.5" fill="#00d484" fontWeight="700">
                ₹{(d.premium / 1000).toFixed(1)}k premium
              </text>
            </g>
          )}
        </g>
      ))}

      {/* Claims dots + tooltips */}
      {data.map((d, i) => (
        <g key={`c${i}`}
          onMouseEnter={() => setHov({ i, line: "claims" })}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "default" }}>
          <circle
            cx={xScale(i)} cy={yScale(d.claims)}
            r={isHov(i, "claims") ? 5.5 : 3.5}
            fill={isHov(i, "claims") ? "#fff" : "#ffb703"}
            stroke="#ffb703" strokeWidth="2"
          />
          {isHov(i, "claims") && (
            <g>
              <rect x={xScale(i) - 32} y={yScale(d.claims) - 30} width="64" height="18" rx="4"
                fill="#0d1f35" stroke="rgba(255,183,3,0.4)" />
              <text x={xScale(i)} y={yScale(d.claims) - 17} textAnchor="middle"
                fontSize="8.5" fill="#ffb703" fontWeight="700">
                ₹{(d.claims / 1000).toFixed(1)}k claims
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [zoneWorkerData,    setZoneWorkerData]    = useState([]);
  const [totalPremium,      setTotalPremium]      = useState(0);
  const [totalPayout,       setTotalPayout]       = useState(0);
  const [zoneFinanceData,   setZoneFinanceData]   = useState([]);
  const [totalWorkersCount, setTotalWorkersCount] = useState(0);
  const [totalStations,     setTotalStations]     = useState(0);

  const totalWorkers = zoneWorkerData.reduce((sum, z) => sum + z.workers, 0);

  const highestZone = zoneWorkerData.length
    ? zoneWorkerData.reduce((max, curr) => curr.workers > max.workers ? curr : max)
    : null;

  const lowestZone = zoneWorkerData.length
    ? zoneWorkerData.reduce((min, curr) => curr.workers < min.workers ? curr : min)
    : null;

  const totalPremiumGraph = zoneFinanceData.reduce((sum, z) => sum + z.premium, 0);
  const totalClaimsGraph  = zoneFinanceData.reduce((sum, z) => sum + z.claims,  0);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
    year:    "numeric",
  });

  function goToAdminPage() {
    navigate("/admin-page");
  }

  useEffect(() => {
    fetchZoneWorkerData();
    fetchTotalPremium();
    fetchTotalPayout();
    fetchZoneFinanceData();
    fetchTotalWorkers();
    fetchTotalStations();
  }, []);

  async function fetchZoneWorkerData() {
    const { data, error } = await supabase
      .from("active_zones")
      .select("zone, worker_count");
    if (error) {
      console.error("Error fetching zone worker data:", error);
    } else {
      setZoneWorkerData(data.map(item => ({ zone: item.zone, workers: item.worker_count })));
    }
  }

  async function fetchTotalPremium() {
    const { data, error } = await supabase
      .from("premium_payments")
      .select("premium_amount");
    if (error) {
      console.error("Error fetching premium:", error);
    } else {
      setTotalPremium(data.reduce((sum, item) => sum + (item.premium_amount || 0), 0));
    }
  }

  async function fetchTotalPayout() {
    const { data, error } = await supabase
      .from("coverage_payout")
      .select("payout_amount");
    if (error) {
      console.error("Error fetching payout:", error);
    } else {
      setTotalPayout(data.reduce((sum, item) => sum + (item.payout_amount || 0), 0));
    }
  }

  async function fetchZoneFinanceData() {
    const { data: workers, error: wErr } = await supabase
      .from("workers")
      .select("id, zone");
    if (wErr) { console.error("Workers fetch error:", wErr); return; }

    const { data: payments, error: pErr } = await supabase
      .from("premium_payments")
      .select("worker_id, premium_amount");
    if (pErr) { console.error("Premium fetch error:", pErr); return; }

    const { data: payouts, error: cErr } = await supabase
      .from("coverage_payout")
      .select("worker_id, payout_amount");
    if (cErr) { console.error("Payout fetch error:", cErr); return; }

    const workerZoneMap = {};
    workers.forEach(w => { workerZoneMap[w.id] = w.zone; });

    const zoneMap = {};

    payments.forEach(p => {
      const zone = workerZoneMap[p.worker_id];
      if (!zone) return;
      if (!zoneMap[zone]) zoneMap[zone] = { zone, premium: 0, claims: 0 };
      zoneMap[zone].premium += p.premium_amount || 0;
    });

    payouts.forEach(c => {
      const zone = workerZoneMap[c.worker_id];
      if (!zone) return;
      if (!zoneMap[zone]) zoneMap[zone] = { zone, premium: 0, claims: 0 };
      zoneMap[zone].claims += c.payout_amount || 0;
    });

    setZoneFinanceData(Object.values(zoneMap));
  }

  async function fetchTotalWorkers() {
    const { count, error } = await supabase
      .from("workers")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error("Error fetching worker count:", error);
    } else {
      setTotalWorkersCount(count);
    }
  }

  async function fetchTotalStations() {
    const { count, error } = await supabase
      .from("stations")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error("Error fetching stations:", error);
    } else {
      setTotalStations(count);
    }
  }

  return (
    <div className="dashboard">

      {/* ── Navbar ── */}
      <div className="navbar">
        <div className="nav-left">
          <div className="nav-logo">🛡️</div>
          <h2 className="nav-title">SaaralCare AI</h2>
        </div>
        <div className="nav-right">
          <span className="nav-label">Admin Panel</span>
        </div>
      </div>

      {/* ── Greeting ── */}
      <div className="greeting-row">
        <div>
          <h1 className="greeting">Good afternoon, Admin 👋</h1>
          <p className="greeting-sub">Here's what's happening across all zones today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-add-records" onClick={goToAdminPage}>+ Add Records</button>
          <div className="date-badge">{formattedDate}</div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi-icon">👷</div>
          <div>
            <div className="kpi-val">{totalWorkersCount}</div>
            <div className="kpi-label">Total Workers</div>
          </div>
        </div>
        <div className="kpi-divider" />
        <div className="kpi">
          <div className="kpi-icon">📡</div>
          <div>
            <div className="kpi-val">{totalStations}</div>
            <div className="kpi-label">Active Stations</div>
          </div>
          <span className="kpi-badge blue">Live</span>
        </div>
        <div className="kpi-divider" />
        <div className="kpi">
          <div className="kpi-icon">🌧</div>
          <div>
            <div className="kpi-val">4</div>
            <div className="kpi-label">Rain Zones</div>
          </div>
          <span className="kpi-badge yellow">Alert</span>
        </div>
        <div className="kpi-divider" />
        <div className="kpi">
          <div className="kpi-icon">📋</div>
          <div>
            <div className="kpi-val">18</div>
            <div className="kpi-label">Pending Approvals</div>
          </div>
          <span className="kpi-badge orange">Action needed</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="main-grid">

        {/* Card 1 — Workers per Zone Line Graph */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-label">WORKERS PER ZONE</div>
              <div className="card-title">
                Zone Distribution{" "}
                <span className="card-sub">{totalWorkers} total</span>
              </div>
            </div>
            <span className="chip chip-green">{zoneWorkerData.length} active zones</span>
          </div>
          <ZoneLineGraph data={zoneWorkerData} />
          <div className="chart-legend">
            <span>
              Highest: {highestZone ? `${highestZone.zone} — ${highestZone.workers}` : "Loading..."}
            </span>
            <span>
              Lowest: {lowestZone ? `${lowestZone.zone} — ${lowestZone.workers}` : "Loading..."}
            </span>
          </div>
        </div>

        {/* Card 2 — Financial Overview */}
        <div className="card">
          <div className="card-label">FINANCIAL OVERVIEW</div>
          <div className="fin-row">
            <div className="fin-block">
              <div className="fin-icon" style={{ background: "rgba(0,212,132,0.15)", color: "#00d484" }}>💰</div>
              <div className="fin-label">Total Premium Received</div>
              <div className="fin-val">₹{totalPremium.toLocaleString()}</div>
            </div>
            <div className="fin-divider" />
            <div className="fin-block">
              <div className="fin-icon" style={{ background: "rgba(255,183,3,0.15)", color: "#ffb703" }}>📤</div>
              <div className="fin-label">Total Payouts Done</div>
              <div className="fin-val">₹{totalPayout.toLocaleString()}</div>
            </div>
          </div>
          <div className="payout-progress-wrap">
            <div className="payout-progress-labels">
              <span>Coverage ratio</span>
              <span className="accent-yellow">66.8%</span>
            </div>
            <div className="progress">
              <div className="bar" style={{ width: "66.8%", background: "#ffb703" }} />
            </div>
          </div>
        </div>

        {/* Card 3 — Premium vs Claims Dual-Line Graph */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-label">PREMIUM VS CLAIMS</div>
              <div className="card-title">By Zone <span className="card-sub">this week</span></div>
            </div>
          </div>
          <div className="dual-legend">
            <span className="dual-legend-item">
              <span className="legend-dot" style={{ background: "#00d484" }} />
              Total Premium Paid
            </span>
            <span className="dual-legend-item">
              <span className="legend-dot legend-dot-dashed" style={{ background: "#ffb703" }} />
              Total Claims Paid
            </span>
          </div>
          <DualLineGraph data={zoneFinanceData} />
          <div className="chart-legend">
            <span style={{ color: "#00d484" }}>
              Premium: ₹{totalPremiumGraph.toLocaleString()}
            </span>
            <span style={{ color: "#ffb703" }}>
              Claims: ₹{totalClaimsGraph.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
