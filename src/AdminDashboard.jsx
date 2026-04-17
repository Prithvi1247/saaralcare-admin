import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./admin.css";

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
  );


function ZoneLineGraph({ data }) {
  const W = 480, H = 110, PAD = { top: 12, right: 16, bottom: 28, left: 36 };
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
    `L${xScale(data.length - 1)},${PAD.top + innerH}`, "Z",
  ].join(" ");
  const [hov, setHov] = useState(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c8e8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00c8e8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right}
          y1={PAD.top + innerH * (1 - t)} y2={PAD.top + innerH * (1 - t)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#lineGrad)" />
      <polyline points={pts} fill="none" stroke="#00c8e8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "default" }}>
          <circle cx={xScale(i)} cy={yScale(d.workers)} r={hov === i ? 6 : 4}
            fill={hov === i ? "#fff" : "#00c8e8"} stroke="#00c8e8" strokeWidth="2" />
          <text
            x={xScale(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            transform={`rotate(-20 ${xScale(i)} ${H - 4})`}
            fill="#6b8aac">
            {d.zone}
          </text>
          {hov === i && (
            <g>
              <rect x={xScale(i) - 26} y={yScale(d.workers) - 26} width="52" height="18" rx="5"
                fill="#122843" stroke="rgba(255,255,255,0.12)" />
              <text x={xScale(i)} y={yScale(d.workers) - 13} textAnchor="middle"
                fontSize="9" fill="#e8f0ff" fontWeight="700">{d.workers} workers</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────
// DualLineGraph component
// ─────────────────────────────────────────────────
function DualLineGraph({ data }) {
  const [hov, setHov] = useState(null);
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
          <stop offset="0%" stopColor="#00d484" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#00d484" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="claimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb703" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={PAD.left - 5} y={t.y + 3.5} textAnchor="end"
            fontSize="8" fill="#6b8aac">{t.label}</text>
        </g>
      ))}

      <path d={premiumArea} fill="url(#premGrad)" />
      <path d={claimsArea}  fill="url(#claimGrad)" />

      <polyline points={premiumPts} fill="none" stroke="#00d484" strokeWidth="2.2"
        strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={claimsPts}  fill="none" stroke="#ffb703" strokeWidth="2.2"
        strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />

      {data.map((d, i) => (
        <text
          key={`lbl-${i}`}
          x={xScale(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize="8"
          transform={`rotate(-20 ${xScale(i)} ${H - 4})`}
          fill="#6b8aac">
          {d.zone}
        </text>
      ))}

      {data.map((d, i) => (
        <g key={`p${i}`}
          onMouseEnter={() => setHov({ i, line: "premium" })}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "default" }}>
          <circle cx={xScale(i)} cy={yScale(d.premium)}
            r={isHov(i, "premium") ? 5.5 : 3.5}
            fill={isHov(i, "premium") ? "#fff" : "#00d484"}
            stroke="#00d484" strokeWidth="2" />
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

      {data.map((d, i) => (
        <g key={`c${i}`}
          onMouseEnter={() => setHov({ i, line: "claims" })}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "default" }}>
          <circle cx={xScale(i)} cy={yScale(d.claims)}
            r={isHov(i, "claims") ? 5.5 : 3.5}
            fill={isHov(i, "claims") ? "#fff" : "#ffb703"}
            stroke="#ffb703" strokeWidth="2" />
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

// ─────────────────────────────────────────────────
// Inline styles (converted from <style> block)
// ─────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:          #050d1a;
    --surface:     #0a1828;
    --surface2:    #0f2035;
    --surface3:    #162843;
    --border:      rgba(255,255,255,0.06);
    --cyan:        #00c8e8;
    --yellow:      #ffb703;
    --green:       #00d484;
    --orange:      #ff8c42;
    --red:         #f05070;
    --text:        #ddeeff;
    --text-dim:    #8aabbf;
    --muted:       #506880;
    --radius:      14px;
    --radius-lg:   18px;
    --accent-cyan:   #00c8e8;
    --accent-yellow: #ffb703;
    --accent-red:    #f05070;
    --accent-green:  #00d484;
    --accent-orange: #ff8c42;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Sora", "Segoe UI", system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 70% 50% at 50% -15%, rgba(0,200,232,0.07), transparent),
      radial-gradient(ellipse 55% 40% at 85% 90%, rgba(0,80,160,0.05), transparent);
  }

  body::before {
    content: "";
    position: fixed; inset: 0;
    background-image: radial-gradient(rgba(0,200,232,0.06) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 0;
    mask-image: radial-gradient(ellipse 120% 80% at 50% 0%, black 40%, transparent);
  }

  .dashboard {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 28px 56px;
    position: relative;
    z-index: 1;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 32px;
  }
  .nav-left  { display: flex; align-items: center; gap: 14px; }
  .nav-logo  {
    width: 34px; height: 34px;
    background: linear-gradient(140deg, #0060d0, #00c8e8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 0 16px rgba(0,200,232,0.22);
  }
  .nav-title {
    font-size: 17px; font-weight: 700; letter-spacing: -0.3px;
  }
  .nav-pipe {
    width: 1px; height: 18px;
    background: var(--border);
  }
  .nav-context {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
  }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-label {
    font-size: 12px; color: var(--accent-cyan);
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 100px;
  }
  .logout {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-family: "Sora", sans-serif;
    transition: all .2s;
  }
  .logout:hover { border-color: var(--cyan); color: var(--cyan); }

  .greeting-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
  }
  .greeting {
    font-size: 26px; font-weight: 700; letter-spacing: -0.6px; line-height: 1.2;
  }
  .greeting-sub { color: var(--muted); font-size: 13.5px; margin-top: 5px; }
  .date-badge {
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 7px 16px;
    border-radius: 100px;
    font-size: 12px;
    color: var(--text-dim);
    white-space: nowrap;
    font-family: "JetBrains Mono", monospace;
  }

  .kpi-strip {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 32px;
    margin-bottom: 24px;
    overflow-x: auto;
    position: relative;
  }
  .kpi-strip::before {
    content: "";
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,200,232,0.25), transparent);
  }
  .kpi { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 155px; }
  .kpi-icon {
    font-size: 20px;
    background: var(--surface2);
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .kpi-val   { font-size: 21px; font-weight: 700; letter-spacing: -0.3px; }
  .kpi-label { font-size: 11px; color: var(--muted); margin-top: 2px; font-family: "JetBrains Mono", monospace; letter-spacing: 0.3px; }
  .kpi-badge {
    margin-left: auto;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 10.5px;
    font-weight: 600;
    white-space: nowrap;
    font-family: "JetBrains Mono", monospace;
  }
  .kpi-badge.green  { background: rgba(0,212,132,0.1);  color: #00d484; border: 1px solid rgba(0,212,132,0.2); }
  .kpi-badge.blue   { background: rgba(0,200,232,0.1);  color: var(--cyan);   border: 1px solid rgba(0,200,232,0.2); }
  .kpi-badge.yellow { background: rgba(255,183,3,0.1);  color: var(--yellow); border: 1px solid rgba(255,183,3,0.2); }
  .kpi-badge.red    { background: rgba(240,80,112,0.1); color: var(--red);    border: 1px solid rgba(240,80,112,0.2); }
  .kpi-badge.orange { background: rgba(255,140,66,0.1); color: var(--orange); border: 1px solid rgba(255,140,66,0.2); }
  .kpi-divider { width: 1px; height: 44px; background: var(--border); margin: 0 28px; flex-shrink: 0; }

  .main-grid   { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 18px; margin-bottom: 18px; }
  .bottom-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  .card::after {
    content: "";
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    pointer-events: none;
  }
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
  .card-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 12px; letter-spacing: 1.3px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 5px;
  }
  .card-title { font-size: 19px; font-weight: 700; letter-spacing: -0.3px; }
  .card-sub   { font-size: 14px; font-weight: 400; color: var(--muted); }
  .card-desc  { font-size: 13px; color: var(--muted); margin: 8px 0 16px; line-height: 1.55; }

  .chip { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .chip-green { background: rgba(0,212,132,0.1); color: #00d484; border: 1px solid rgba(0,212,132,0.2); }

  .mini-bar-chart {
    display: flex; align-items: flex-end; gap: 5px;
    height: 88px; padding: 0 0 4px;
  }
  .mini-bar-col {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 5px; height: 100%; justify-content: flex-end;
  }
  .mini-bar-fill {
    width: 100%; border-radius: 4px 4px 0 0; min-height: 4px;
    transition: height .4s ease; opacity: 0.8;
  }
  .mini-bar-fill:hover { opacity: 1; filter: brightness(1.15); }
  .mini-bar-label { font-size: 9.5px; color: var(--muted); font-family: "JetBrains Mono", monospace; }
  .chart-legend {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--muted);
    margin-top: 10px; padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  .fin-row   { display: flex; gap: 0; margin: 14px 0; }
  .fin-block { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .fin-divider { width: 1px; background: var(--border); margin: 0 18px; flex-shrink: 0; }
  .fin-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; margin-bottom: 4px;
    border: 1px solid var(--border);
  }
  .fin-label { font-size: 10.5px; color: var(--muted); font-family: "JetBrains Mono", monospace; letter-spacing: 0.3px; }
  .fin-val   { font-size: 19px; font-weight: 700; letter-spacing: -0.3px; }
  .fin-meta  { font-size: 11px; color: var(--muted); }
  .payout-progress-wrap { margin: 4px 0 16px; }
  .payout-progress-labels {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--yellow); margin-bottom: 6px;
  }
  .accent-yellow { color: var(--yellow) !important; }
  .fin-actions { display: flex; gap: 10px; }

  .progress { height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
  .bar { height: 100%; background: var(--cyan); border-radius: 100px; transition: width .6s ease; }

  .btn {
    background: var(--cyan);
    border: none; padding: 9px 18px;
    border-radius: 9px; color: #050d1a;
    cursor: pointer; font-weight: 600; font-size: 12.5px;
    font-family: "Sora", sans-serif;
    transition: all .2s;
  }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-sm { padding: 6px 13px; font-size: 12px; }
  .btn-outline {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
  }
  .btn-outline:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(0,200,232,0.06); }

  .dual-legend { display: flex; gap: 18px; margin-bottom: 12px; }
  .dual-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
  .legend-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .legend-dot-dashed { border-radius: 2px; height: 3px; width: 15px; }

  .card-lookup { display: flex; flex-direction: column; }
  .lookup-selects { display: flex; flex-direction: column; gap: 11px; margin: 13px 0; }
  .select-wrap   { display: flex; flex-direction: column; gap: 5px; }
  .select-label  { font-size: 12px; color: var(--muted); letter-spacing: 0.5px; font-family: "JetBrains Mono", monospace; text-transform: uppercase; }
  .custom-select {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 9px 32px 9px 12px;
    border-radius: 9px; font-size: 13px;
    font-family: "Sora", sans-serif;
    cursor: pointer; outline: none;
    transition: border-color .2s, background .2s; width: 100%;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%23506880' d='M5 7L0 0h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }
  .custom-select:focus { border-color: rgba(0,200,232,0.4); background: var(--surface3); }
  .custom-select:disabled { opacity: 0.35; cursor: not-allowed; }

  .lookup-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; color: var(--muted); font-size: 13px;
    padding: 20px 0; text-align: center;
  }
  .lookup-empty span { font-size: 26px; }

  .worker-result {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 14px; margin-top: 4px;
  }
  .worker-name  { font-size: 16px; font-weight: 700; margin-bottom: 2px; letter-spacing: -0.2px; }
  .worker-zone  { font-size: 11.5px; color: var(--muted); margin-bottom: 14px; font-family: "JetBrains Mono", monospace; }
  .worker-stats { display: flex; flex-direction: column; gap: 9px; }
  .wstat {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); padding: 9px 12px;
    border-radius: 9px; border: 1px solid var(--border);
  }
  .wstat-icon  { font-size: 16px; }
  .wstat-label { font-size: 10.5px; color: var(--muted); font-family: "JetBrains Mono", monospace; }
  .wstat-val   { font-size: 14px; font-weight: 700; }

  .btn-add-records {
    background: linear-gradient(135deg, #e8a800, #ffd332);
    border: none;
    padding: 9px 20px;
    border-radius: 9px;
    color: #0a1000;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    font-family: "Sora", sans-serif;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 18px rgba(255,183,3,0.32);
    transition: all .2s;
    white-space: nowrap;
  }
  .btn-add-records:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 6px 26px rgba(255,183,3,0.48);
  }

  .expand-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px;
    transition: all .2s; flex-shrink: 0;
  }
  .expand-btn:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(0,200,232,0.07); }

  .graph-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(5,13,26,0.85);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .graph-modal {
    background: var(--surface);
    border: 1px solid rgba(0,200,232,0.15);
    border-radius: 22px;
    width: calc(100vw - 48px);
    height: calc(100vh - 48px);
    max-width: 1400px;
    display: flex; flex-direction: column;
    padding: 30px 34px 26px;
    box-shadow: 0 0 80px rgba(0,200,232,0.08), 0 28px 90px rgba(0,0,0,0.65);
    animation: scaleIn .22s cubic-bezier(.22,1,.36,1);
    overflow: hidden;
  }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  .graph-modal-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 22px; flex-shrink: 0;
  }
  .graph-modal-close {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    color: var(--text);
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; line-height: 1;
    transition: all .2s; flex-shrink: 0;
  }
  .graph-modal-close:hover { background: rgba(240,80,112,0.12); border-color: var(--red); color: var(--red); }
  .graph-modal-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .graph-modal-chart { flex: 1; min-height: 0; }
  .graph-modal-chart svg { width: 100% !important; height: 100% !important; }
  .graph-modal-legend {
    display: flex; justify-content: space-between;
    font-size: 16px; color: var(--muted);
    margin-top: 16px; padding-top: 14px;
    border-top: 1px solid var(--border); flex-shrink: 0;
  }

  .single-card-row { display: flex; justify-content: flex-start; gap: 18px; }
  .full-width-row  { width: 100%; margin-top: 18px; grid-column: 1 / -1; }
  .full-width-row .card { width: 100%; }

  table { border-collapse: collapse; width: 100%; }
  th {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px; letter-spacing: 0.8px; text-transform: uppercase;
    color: var(--muted); padding-bottom: 10px; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  td { font-size: 13px; padding: 11px 0; color: var(--text); }

  @media (max-width: 900px) {
    .main-grid, .bottom-grid { grid-template-columns: 1fr; }
    .kpi-strip { flex-wrap: wrap; gap: 16px; }
    .kpi-divider { display: none; }
    .greeting-row { flex-direction: column; gap: 12px; }
  }
`;

// ─────────────────────────────────────────────────
// Main AdminDashboard component
// ─────────────────────────────────────────────────
export default function AdminDashboard({ onNavigateToAdminPage, onLogout }) {
  const [isZoneGraphExpanded, setIsZoneGraphExpanded] = useState(false);
  const [selectedZone, setSelectedZone]     = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [zoneWorkerData, setZoneWorkerData] = useState([]);
  const [zones, setZones]                   = useState([]);
  const [totalPremium, setTotalPremium]     = useState(0);
  const [totalPayout, setTotalPayout]       = useState(0);
  const [zoneFinanceData, setZoneFinanceData] = useState([]);
  const [totalWorkersCount, setTotalWorkersCount] = useState(0);
  const [totalStations, setTotalStations]   = useState(0);
  const [rainZones, setRainZones]           = useState(0);
  const [isDualGraphExpanded, setIsDualGraphExpanded] = useState(false);
  const [triggerPopup, setTriggerPopup]     = useState(null);
  const [activeUsers, setActiveUsers]       = useState(0);
  const [selectedRainZone, setSelectedRainZone] = useState("");
  const [rainData, setRainData]             = useState(null);
  const [recentPayouts, setRecentPayouts]   = useState([]);

  const totalWorkers = zoneWorkerData.reduce((sum, z) => sum + z.workers, 0);

  const highestZone = zoneWorkerData.length
    ? zoneWorkerData.reduce((max, curr) => curr.workers > max.workers ? curr : max)
    : null;

  const lowestZone = zoneWorkerData.length
    ? zoneWorkerData.reduce((min, curr) => curr.workers < min.workers ? curr : min)
    : null;

  const totalPremiumGraph = zoneFinanceData.reduce((sum, z) => sum + z.premium, 0);
  const totalClaimsGraph  = zoneFinanceData.reduce((sum, z) => sum + z.claims, 0);
  const lossRatio = totalPremium > 0 ? ((totalPayout / totalPremium) * 100).toFixed(1) : 0;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

  function goToAdminPage() {
    if (onNavigateToAdminPage) onNavigateToAdminPage();
    else window.location.href = "AdminPage.jsx";
  }

  // ── Fetch functions ──
  useEffect(() => {
    fetchZones();
    fetchZoneWorkerData();
    fetchTotalPremium();
    fetchTotalPayout();
    fetchZoneFinanceData();
    fetchTotalWorkers();
    fetchTotalStations();
    fetchRainZones();
    fetchActiveUsers();
    fetchRecentPayouts();
  }, []);

  useEffect(() => {
    function handleClick() { setTriggerPopup(null); }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  async function fetchZones() {
    const { data, error } = await supabase.from('zones').select('zone_name');
    if (error) console.error("Error fetching zones:", error);
    else setZones(data);
  }

  async function fetchZoneWorkerData() {
    const { data, error } = await supabase.from('active_zones').select('zone, worker_count');
    if (error) console.error("Error fetching zone worker data:", error);
    else setZoneWorkerData(data.map(item => ({ zone: item.zone, workers: item.worker_count })));
  }

  async function fetchTotalPremium() {
    const { data, error } = await supabase.from('premium_payments').select('premium_amount');
    if (error) console.error("Error fetching premium:", error);
    else setTotalPremium(data.reduce((sum, item) => sum + (item.premium_amount || 0), 0));
  }

  async function fetchTotalPayout() {
    const { data, error } = await supabase.from('coverage_payout').select('payout_amount');
    if (error) console.error("Error fetching payout:", error);
    else setTotalPayout(data.reduce((sum, item) => sum + (item.payout_amount || 0), 0));
  }

  async function fetchZoneFinanceData() {
    const { data: workers, error: wErr } = await supabase.from('workers').select('id, zone');
    if (wErr) { console.error("Workers fetch error:", wErr); return; }

    const { data: payments, error: pErr } = await supabase.from('premium_payments').select('worker_id, premium_amount');
    if (pErr) { console.error("Premium fetch error:", pErr); return; }

    const { data: payouts, error: cErr } = await supabase.from('coverage_payout').select('worker_id, payout_amount');
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
    const { count, error } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    if (error) console.error("Error fetching worker count:", error);
    else setTotalWorkersCount(count);
  }

  async function fetchTotalStations() {
    const { count, error } = await supabase.from('stations').select('*', { count: 'exact', head: true });
    if (error) console.error("Error fetching stations:", error);
    else setTotalStations(count);
  }

  async function fetchRainZones() {
    const { data, error } = await supabase.from('rainfall_events').select('zone_name, rainfall_mm');
    if (error) { console.error("Error fetching rain zones:", error); return; }
    const activeZones = data.filter(d => d.rainfall_mm > 0);
    const uniqueZones = new Set(activeZones.map(d => d.zone_name));
    setRainZones(uniqueZones.size);
  }

  async function fetchRainData(zone) {
    const [
      { data: baseData,    error: baseErr },
      { data: peakData,    error: peakErr },
      { data: nonPeakData, error: nonPeakErr }
    ] = await Promise.all([
      supabase.from('rainfall_events').select('*').eq('zone_name', zone).limit(1).single(),
      supabase.from('rainfall_events_peak').select('*').eq('zone_name', zone).limit(1).single(),
      supabase.from('rainfall_events_NON_peak').select('*').eq('zone_name', zone).limit(1).single()
    ]);

    if (baseErr) {
      console.error("Rain data error:", baseErr);
      setRainData(null);
    } else {
      setRainData({
        ...baseData,
        peak_rainfall_mm:     peakData?.rainfall_mm    ?? null,
        non_peak_rainfall_mm: nonPeakData?.rainfall_mm ?? null,
      });
    }
  }

  async function fetchRecentPayouts() {
    const { data, error } = await supabase
      .from('coverage_payout')
      .select(`payout_amount, payout_time, worker_id, workers ( name, zone )`)
      .order('payout_time', { ascending: false })
      .limit(5);

    if (error) { console.error("Payout fetch error:", error); return; }

    const [
      { data: rainfallData },
      { data: peakData },
      { data: nonPeakData }
    ] = await Promise.all([
      supabase.from('rainfall_events').select('*'),
      supabase.from('rainfall_events_peak').select('*'),
      supabase.from('rainfall_events_NON_peak').select('*')
    ]);

    const rainfallMap = {};
    (rainfallData || []).forEach(r => { rainfallMap[r.zone_name] = r; });
    const peakMap = {};
    (peakData || []).forEach(r => { peakMap[r.zone_name] = r; });
    const nonPeakMap = {};
    (nonPeakData || []).forEach(r => { nonPeakMap[r.zone_name] = r; });

    const enriched = data.map(p => {
      const zone = p.workers?.zone;
      const rain    = rainfallMap[zone];
      const peak    = peakMap[zone];
      const nonPeak = nonPeakMap[zone];

      let trigger = 0;
      let type = "NONE";

      if (rain) {
        trigger = rain.rainfall_mm;
        const peakMm    = peak?.rainfall_mm    ?? 0;
        const nonPeakMm = nonPeak?.rainfall_mm ?? 0;
        if ((peakMm > 45) || (nonPeakMm > 75) || trigger > 95) {
          type = "FULL";
        } else if ((peakMm > 15) || (nonPeakMm > 35) || trigger > 40) {
          type = "PARTIAL";
        }
      }
      return { ...p, trigger, type };
    });

    setRecentPayouts(enriched);
  }

  async function fetchActiveUsers() {
    const { count, error } = await supabase
      .from('workers').select('*', { count: 'exact', head: true }).eq('plan_status', 'active');
    if (error) console.error("Error fetching active users:", error);
    else setActiveUsers(count);
  }

  function handleZoneChange(e) {
    const zone = e.target.value;
    setSelectedRainZone(zone);
    if (zone) fetchRainData(zone);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_authed");
    sessionStorage.removeItem("admin_user");
    if (onLogout) onLogout();
    else window.location.href = "AdminLogin.jsx";
  }

  // ── Payout type helpers ──
  function getPayoutColor(type) {
    return type === "FULL" ? "#00d484" : type === "PARTIAL" ? "#ffb703" : "#6b8aac";
  }
  function getRainColor(mm, peakMm, nonPeakMm) {
    if ((peakMm > 45) || (nonPeakMm > 75) || mm > 95) return "#00d484";
    if ((peakMm > 15) || (nonPeakMm > 35) || mm > 40) return "#ffb703";
    return "#6b8aac";
  }
  function getRainType(mm, peakMm, nonPeakMm) {
    if ((peakMm > 45) || (nonPeakMm > 75) || mm > 95) return "FULL";
    if ((peakMm > 15) || (nonPeakMm > 35) || mm > 40) return "PARTIAL";
    return "NONE";
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        {/* ── Navbar ── */}
        <div className="navbar">
          <div className="nav-left">
            <div className="nav-logo">🛡️</div>
            <h2 className="nav-title">SaaralCareAI</h2>
            <div className="nav-pipe"></div>
            <span className="nav-context"><b>Admin</b></span>
          </div>
          <div className="nav-right">
            <span className="nav-label">
              <b>{sessionStorage.getItem("admin_user") || "Admin"}</b>
            </span>
            <button className="logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {/* ── Greeting ── */}
        <div className="greeting-row">
          <div>
            <h1 className="greeting">Good afternoon, Admin 👋</h1>
            <p className="greeting-sub">Here's what's happening across all zones today.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-add-records" onClick={goToAdminPage}>  Simulate Rain </button>
            <div className="date-badge"><b>{formattedDate}</b></div>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="kpi-strip">
          <div className="kpi">
            <div className="kpi-icon">👷</div>
            <div>
              <div className="kpi-val">{totalWorkersCount}</div>
              <div className="kpi-label"><b>Total Workers</b></div>
            </div>
          </div>
          <div className="kpi-divider" />
          <div className="kpi">
            <div className="kpi-icon">🟢</div>
            <div>
              <div className="kpi-val">{activeUsers}</div>
              <div className="kpi-label"><b>Active Workers</b></div>
            </div>
            <span className="kpi-badge green">Live</span>
          </div>
          <div className="kpi-divider" />
          <div className="kpi">
            <div className="kpi-icon">📡</div>
            <div>
              <div className="kpi-val">{totalStations}</div>
              <div className="kpi-label"><b>Active Stations</b></div>
            </div>
            <span className="kpi-badge blue">Live</span>
          </div>
          <div className="kpi-divider" />
          <div className="kpi">
            <div className="kpi-icon">🌧</div>
            <div>
              <div className="kpi-val">{rainZones}</div>
              <div className="kpi-label"><b>Rain Zones</b></div>
            </div>
            <span className="kpi-badge red">Alert</span>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="main-grid">

          {/* Zone Distribution Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-label"><b>WORKERS PER ZONE</b></div>
                <div className="card-title"><b>Zone Distribution </b><span className="card-sub"><b>{totalWorkers} Total Workers</b></span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="expand-btn" title="Expand graph" onClick={() => setIsZoneGraphExpanded(true)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 5V1H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 1H13V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 9V13H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 13H1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="chip chip-green"> {zoneWorkerData.length} active zones </span>
              </div>
            </div>
            <ZoneLineGraph data={zoneWorkerData} />
            <div className="chart-legend">
              <span><b>Highest: {highestZone ? `${highestZone.zone} — ${highestZone.workers}` : "Loading..."}</b></span>
              <span><b>Lowest: {lowestZone ? `${lowestZone.zone} — ${lowestZone.workers}` : "Loading..."}</b></span>
            </div>
          </div>

          {/* Financial Overview Card */}
          <div className="card">
            <div className="card-label"><b>FINANCIAL OVERVIEW</b></div>
            <div className="fin-row">
              <div className="fin-block">
                <div className="fin-icon" style={{ background: "rgba(0,212,132,0.15)", color: "#00d484" }}>💰</div>
                <div className="fin-label"><b>Total Premium Received</b></div>
                <div className="fin-val">₹{totalPremium.toLocaleString()}</div>
              </div>
              <div className="fin-divider" />
              <div className="fin-block">
                <div className="fin-icon" style={{ background: "rgba(255,183,3,0.15)", color: "#ffb703" }}>📤</div>
                <div className="fin-label"><b>Total Payouts Done</b></div>
                <div className="fin-val">₹{totalPayout.toLocaleString()}</div>
              </div>
            </div>
            <div className="payout-progress-wrap">
              <div className="payout-progress-labels">
                <span><b>Loss ratio</b></span>
                <span className="accent-yellow">{lossRatio}%</span>
              </div>
              <div className="progress">
                <div className="bar" style={{ width: `${lossRatio}%`, background: "#ffb703" }} />
              </div>
            </div>
          </div>

          {/* Premium vs Claims Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-label"><b>PREMIUM VS CLAIMS</b></div>
                <div className="card-title">
                  <b>By Zone </b>
                  <span className="card-sub"><b>this week</b></span>
                </div>
              </div>
              <button className="expand-btn" title="Expand graph" onClick={() => setIsDualGraphExpanded(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 5V1H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 1H13V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 9V13H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13H1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="dual-legend">
              <span className="dual-legend-item">
                <span className="legend-dot" style={{ background: "#00d484" }}></span>
                <b>Total Premium Paid</b>
              </span>
              <span className="dual-legend-item">
                <span className="legend-dot legend-dot-dashed" style={{ background: "#ffb703" }}></span>
                <b>Total Claims Paid</b>
              </span>
            </div>
            <DualLineGraph data={zoneFinanceData} />
            <div className="chart-legend">
              <span style={{ color: "#00d484" }}><b>Premium: ₹{totalPremiumGraph.toLocaleString()}</b></span>
              <span style={{ color: "#ffb703" }}><b>Claims: ₹{totalClaimsGraph.toLocaleString()}</b></span>
            </div>
          </div>

          {/* Rainfall Status – full width */}
          <div className="full-width-row">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-label"><b>RAINFALL STATUS</b></div>
                </div>
              </div>
              <div className="lookup-selects">
                <div className="select-wrap">
                  <label className="select-label"><b>Select Zone</b></label>
                  <select
                    className="custom-select"
                    value={selectedRainZone}
                    onChange={handleZoneChange}
                  >
                    <option value="">-- Choose Zone --</option>
                    {zones.map((z, i) => (
                      <option key={i} value={z.zone_name}>{z.zone_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!rainData ? (
                <div className="lookup-empty">
                  <span>🌧</span>
                  <div>Select a zone to view rainfall data</div>
                </div>
              ) : (
                <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ color: "#6b8aac", textAlign: "left" }}>
                      <th style={{ paddingBottom: "8px", width: "18%" }}>Zone</th>
                      <th style={{ paddingBottom: "8px", width: "18%" }}>Total Rainfall</th>
                      <th style={{ paddingBottom: "8px", width: "20%" }}>Peak Hours Rainfall</th>
                      <th style={{ paddingBottom: "8px", width: "24%" }}>Non-Peak Hours Rainfall</th>
                      <th style={{ paddingBottom: "8px", width: "20%" }}>Type of Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ paddingTop: "10px" }}>{rainData.zone_name}</td>
                      <td style={{ paddingTop: "10px" }}>{rainData.rainfall_mm} mm</td>
                      <td style={{ paddingTop: "10px" }}>
                        {rainData.peak_rainfall_mm != null
                          ? <span style={{ color: "#00c8e8", fontWeight: "600" }}>{rainData.peak_rainfall_mm} mm</span>
                          : <span style={{ color: "#506880" }}>—</span>}
                      </td>
                      <td style={{ paddingTop: "10px" }}>
                        {rainData.non_peak_rainfall_mm != null
                          ? <span style={{ color: "#8aabbf", fontWeight: "600" }}>{rainData.non_peak_rainfall_mm} mm</span>
                          : <span style={{ color: "#506880" }}>—</span>}
                      </td>
                      <td style={{
                        paddingTop: "10px",
                        color: getRainColor(
                          rainData.rainfall_mm,
                          rainData.peak_rainfall_mm ?? 0,
                          rainData.non_peak_rainfall_mm ?? 0
                        ),
                        fontWeight: "600"
                      }}>
                        {getRainType(
                          rainData.rainfall_mm,
                          rainData.peak_rainfall_mm ?? 0,
                          rainData.non_peak_rainfall_mm ?? 0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Payouts – full width */}
          <div className="full-width-row">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-label"><b>RECENT PAYOUTS</b></div>
                  <div className="card-sub">Latest claim disbursements</div>
                </div>
              </div>
              {recentPayouts.length === 0 ? (
                <div className="lookup-empty">
                  <span>💸</span>
                  <div>No recent payouts</div>
                </div>
              ) : (
                <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ color: "#6b8aac", textAlign: "left" }}>
                      <th style={{ paddingBottom: "8px", width: "18%" }}>User</th>
                      <th style={{ paddingBottom: "8px", width: "14%" }}>Zone</th>
                      <th style={{ paddingBottom: "8px", width: "14%" }}>Rainfall</th>
                      <th style={{ paddingBottom: "8px", width: "20%" }}>Type of Payment</th>
                      <th style={{ paddingBottom: "8px", width: "14%" }}>Amount</th>
                      <th style={{ paddingBottom: "8px", width: "20%" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayouts.map((p, i) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={{ paddingTop: "10px", paddingRight: "8px" }}>{p.workers?.name || "—"}</td>
                        <td style={{ paddingTop: "10px", paddingRight: "8px" }}>{p.workers?.zone || "—"}</td>
                        <td style={{ paddingTop: "10px", paddingRight: "8px", color: "#8aabbf" }}>{p.trigger != null ? `${p.trigger} mm` : "—"}</td>
                        <td style={{ paddingTop: "10px", paddingRight: "8px", position: "relative" }}>
                          <span
                            style={{
                              color: getPayoutColor(p.type),
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.target.getBoundingClientRect();
                              setTriggerPopup({
                                x: rect.left + window.scrollX,
                                y: rect.top + window.scrollY,
                                rainfall: p.trigger ?? 0,
                                type: p.type
                              });
                            }}
                          >
                            {p.type}
                          </span>
                        </td>
                        <td style={{ paddingTop: "10px", paddingRight: "8px", fontWeight: "600" }}>
                          ₹{p.payout_amount}
                        </td>
                        <td style={{ paddingTop: "10px", color: "#6b8aac" }}>
                          {new Date(p.payout_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>{/* end main-grid */}

        {/* ── Zone Graph Modal ── */}
        {isZoneGraphExpanded && (
          <div className="graph-modal-overlay" onClick={() => setIsZoneGraphExpanded(false)}>
            <div className="graph-modal" onClick={e => e.stopPropagation()}>
              <div className="graph-modal-header">
                <div>
                  <div className="card-label" style={{ marginBottom: 6 }}><b>WORKERS PER ZONE</b></div>
                  <div className="card-title" style={{ fontSize: 24 }}>
                    <b>Zone Distribution </b>
                    <span className="card-sub"><b>{totalWorkers} Total Workers</b></span>
                  </div>
                </div>
                <button className="graph-modal-close" onClick={() => setIsZoneGraphExpanded(false)} title="Close">✕</button>
              </div>
              <div className="graph-modal-body">
                <div className="graph-modal-chart">
                  <ZoneLineGraph data={zoneWorkerData} />
                </div>
                <div className="graph-modal-legend">
                  <span><b>Highest: {highestZone ? `${highestZone.zone} — ${highestZone.workers}` : "Loading..."}</b></span>
                  <span><b>Lowest: {lowestZone ? `${lowestZone.zone} — ${lowestZone.workers}` : "Loading..."}</b></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Dual Graph Modal ── */}
        {isDualGraphExpanded && (
          <div className="graph-modal-overlay" onClick={() => setIsDualGraphExpanded(false)}>
            <div className="graph-modal" onClick={e => e.stopPropagation()}>
              <div className="graph-modal-header">
                <div>
                  <div className="card-label" style={{ marginBottom: 6 }}><b>PREMIUM VS CLAIMS</b></div>
                  <div className="card-title" style={{ fontSize: 24 }}>
                    <b>By Zone </b>
                    <span className="card-sub"><b>this week</b></span>
                  </div>
                </div>
                <button className="graph-modal-close" onClick={() => setIsDualGraphExpanded(false)}>✕</button>
              </div>
              <div className="graph-modal-body">
                <div className="dual-legend" style={{ marginBottom: 18 }}>
                  <span className="dual-legend-item">
                    <span className="legend-dot" style={{ background: "#00d484" }}></span>
                    <b>Total Premium Paid</b>
                  </span>
                  <span className="dual-legend-item">
                    <span className="legend-dot legend-dot-dashed" style={{ background: "#ffb703" }}></span>
                    <b>Total Claims Paid</b>
                  </span>
                </div>
                <div className="graph-modal-chart">
                  <DualLineGraph data={zoneFinanceData} />
                </div>
                <div className="graph-modal-legend">
                  <span style={{ color: "#00d484" }}>Premium: ₹{totalPremiumGraph.toLocaleString()}</span>
                  <span style={{ color: "#ffb703" }}>Claims: ₹{totalClaimsGraph.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Trigger Popup ── */}
        {triggerPopup && (
          <div
            style={{
              position: "absolute",
              top: triggerPopup.y - 180,
              left: triggerPopup.x - 120,
              width: "300px",
              background: "#122843",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "18px",
              zIndex: 9999,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "12px" }}>
              Trigger Explanation
            </div>
            <div style={{ lineHeight: "1.6", fontSize: "14px" }}>
              <div>Rainfall: {triggerPopup.rainfall} mm</div>
              <div style={{ marginBottom: "10px", color: "#6b8aac" }}>Thresholds:</div>
              <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                <div style={{ color: "#8aabbf", marginBottom: "4px" }}>Full Payout:</div>
                <div>Peak hrs &gt; 45 mm → <span style={{ color: "#00d484" }}>FULL</span></div>
                <div>Non-peak &gt; 75 mm → <span style={{ color: "#00d484" }}>FULL</span></div>
                <div>Total &gt; 95 mm → <span style={{ color: "#00d484" }}>FULL</span></div>
                <div style={{ color: "#8aabbf", margin: "6px 0 4px" }}>Partial Payout:</div>
                <div>Peak hrs &gt; 15 mm → <span style={{ color: "#ffb703" }}>PARTIAL</span></div>
                <div>Non-peak &gt; 35 mm → <span style={{ color: "#ffb703" }}>PARTIAL</span></div>
                <div>Total &gt; 40 mm → <span style={{ color: "#ffb703" }}>PARTIAL</span></div>
              </div>
              <div style={{ marginTop: "12px" }}>
                Decision:{" "}
                <span style={{ color: getPayoutColor(triggerPopup.type), fontWeight: "700" }}>
                  {triggerPopup.type} payout
                </span>
              </div>
            </div>
            <button
              style={{
                marginTop: "12px",
                padding: "6px 12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                color: "#e8f0ff",
                cursor: "pointer"
              }}
              onClick={() => setTriggerPopup(null)}
            >
              Close
            </button>
          </div>
        )}

      </div>
    </>
  );
}
