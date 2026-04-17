import { useState, useEffect } from "react";

const SUPABASE_URL =  import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =import.meta.env.VITE_SUPABASE_ANON_KEY;

async function supabaseFetch(table, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => params.append(k, `eq.${v}`));
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Supabase request failed");
  return res.json();
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:            #050d1a;
    --surface:       #0a1828;
    --surface2:      #0f2035;
    --surface3:      #162843;
    --border:        rgba(255,255,255,0.06);
    --border-active: rgba(0,200,232,0.4);
    --accent-cyan:   #00c8e8;
    --accent-yellow: #ffb703;
    --accent-green:  #00d484;
    --text:          #ddeeff;
    --text-dim:      #8aabbf;
    --muted:         #506880;
    --danger:        #f05070;
    --radius-sm:     8px;
    --radius:        14px;
    --radius-lg:     22px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Sora", system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse 70% 55% at 50% -10%, rgba(0,200,232,0.08), transparent),
      radial-gradient(ellipse 50% 40% at 85% 85%, rgba(0,80,160,0.07), transparent),
      radial-gradient(ellipse 35% 50% at 5% 65%, rgba(0,212,132,0.04), transparent),
      var(--bg);
  }

  .login-root::before {
    content: "";
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(0,200,232,0.09) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .orb-1 { width: 400px; height: 400px; background: rgba(0,200,232,0.04); top: -120px; left: -80px; animation-delay: 0s; }
  .orb-2 { width: 300px; height: 300px; background: rgba(0,100,200,0.05); bottom: -60px; right: -40px; animation-delay: -4s; }
  @keyframes drift {
    from { transform: translate(0, 0); }
    to   { transform: translate(30px, 20px); }
  }

  .login-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 48px 44px 44px;
    width: 100%;
    max-width: 428px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,200,232,0.05),
      0 32px 80px rgba(0,0,0,0.6),
      0 0 120px rgba(0,200,232,0.03);
    animation: cardIn .5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card-glow {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,200,232,0.5), transparent);
  }

  .card-corner {
    position: absolute;
    top: 0; right: 0;
    width: 120px; height: 120px;
    background: radial-gradient(ellipse at top right, rgba(0,200,232,0.07), transparent 70%);
    pointer-events: none;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }
  .brand-mark {
    width: 44px; height: 44px;
    background: linear-gradient(140deg, #0060d0, #00c8e8);
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 24px rgba(0,200,232,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
    flex-shrink: 0;
  }
  .brand-name {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: var(--text);
  }
  .brand-tag {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 1.4px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .login-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.25;
    margin-bottom: 6px;
  }
  .login-desc {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 30px;
    line-height: 1.5;
  }

  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 0 -44px 28px;
  }

  .fields { display: flex; flex-direction: column; gap: 18px; margin-bottom: 26px; }

  .field { display: flex; flex-direction: column; gap: 7px; }

  .field-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    color: var(--accent-cyan);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .field-label::before {
    content: "";
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--accent-cyan);
    opacity: 0.7;
  }

  .field-wrap { position: relative; }

  .field-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    opacity: 0.4;
    pointer-events: none;
    line-height: 1;
  }

  .field-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 12px 42px 12px 40px;
    border-radius: var(--radius);
    font-size: 14px;
    font-family: "Sora", sans-serif;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .field-input::placeholder { color: var(--muted); }
  .field-input:focus {
    border-color: var(--border-active);
    box-shadow: 0 0 0 3px rgba(0,200,232,0.08);
    background: var(--surface3);
  }
  .field-input.is-error {
    border-color: rgba(240,80,112,0.5);
    box-shadow: 0 0 0 3px rgba(240,80,112,0.08);
  }

  .pw-footer {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  .show-pw-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
    transition: color .2s;
  }
  .show-pw-label:hover { color: var(--text-dim); }
  .show-pw-label input[type="checkbox"] {
    appearance: none; -webkit-appearance: none;
    position: absolute; opacity: 0; width: 0; height: 0;
  }
  .pw-checkbox {
    width: 16px; height: 16px;
    border: 1.5px solid var(--muted);
    border-radius: 4px;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color .2s, background .2s;
  }
  .show-pw-label input[type="checkbox"]:checked + .pw-checkbox {
    border-color: var(--accent-cyan);
    background: var(--accent-cyan);
  }
  .pw-checkbox svg { opacity: 0; transition: opacity .15s; }
  .show-pw-label input[type="checkbox"]:checked + .pw-checkbox svg { opacity: 1; }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(240,80,112,0.08);
    border: 1px solid rgba(240,80,112,0.2);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    font-size: 13px;
    color: var(--danger);
    margin-bottom: 20px;
  }
  .error-banner.hidden { display: none; }
  .error-icon {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(240,80,112,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  .btn-login {
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
    box-shadow: 0 4px 24px rgba(255,183,3,0.3);
    transition: all .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
  }
  .btn-login::before {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity .2s;
  }
  .btn-login:hover:not(:disabled)::before { opacity: 1; }
  .btn-login:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(255,183,3,0.45);
  }
  .btn-login:active:not(:disabled) { transform: translateY(0); }
  .btn-login:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(10,16,0,0.3);
    border-top-color: #0a1000;
    border-radius: 50%;
    animation: spin .65s linear infinite;
    display: none;
  }
  .spinner.visible { display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .success-overlay {
    position: absolute; inset: 0;
    background: var(--surface);
    border-radius: var(--radius-lg);
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 10;
    animation: fadeIn .3s ease both;
  }
  .success-overlay.visible { display: flex; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .success-ring {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: rgba(0,212,132,0.1);
    border: 1.5px solid rgba(0,212,132,0.35);
    display: flex; align-items: center; justify-content: center;
  }
  .success-checkmark {
    font-size: 26px;
    color: var(--accent-green);
  }
  .success-title { font-size: 17px; font-weight: 700; color: var(--accent-green); }
  .success-sub { font-size: 12px; color: var(--muted); }

  .status-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 20px;
    justify-content: center;
  }
  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent-green);
    animation: pulse 2.4s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }
  .status-text { font-size: 11px; color: var(--muted); font-family: "JetBrains Mono", monospace; }

  @media (max-width: 480px) {
    .login-card { padding: 36px 28px 32px; margin: 16px; }
    .login-title { font-size: 21px; }
    .section-divider { margin: 0 -28px 24px; }
  }
`;

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Clear auth on mount
    sessionStorage.removeItem("admin_authed");
    sessionStorage.removeItem("admin_user");
  }, []);

  function clearError() {
    setErrorMsg("");
  }

  async function handleLogin() {
    clearError();
    if (!username.trim() || !password) {
      setErrorMsg("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const rows = await supabaseFetch("admin_credentials", { username: username.trim() });
      const matched = Array.isArray(rows) && rows.length > 0 && rows[0].password === password;
      if (matched) {
        sessionStorage.setItem("admin_authed", "true");
        sessionStorage.setItem("admin_user", username.trim());
        setSuccess(true);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
          else window.location.href = "AdminDashboard.jsx";
        }, 1400);
      } else {
        setErrorMsg("Invalid username or password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Check your Supabase config and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="login-card">
          <div className="card-glow" />
          <div className="card-corner" />

          {/* Success overlay */}
          <div className={`success-overlay${success ? " visible" : ""}`}>
            <div className="success-ring">
              <span className="success-checkmark">✓</span>
            </div>
            <div className="success-title">Access Granted</div>
            <div className="success-sub">Redirecting to dashboard…</div>
          </div>

          {/* Brand */}
          <div className="brand">
            <div className="brand-mark">🛡️</div>
            <div>
              <div className="brand-name">SaaralCareAI</div>
              <div className="brand-tag"><b>Admin Portal</b></div>
            </div>
          </div>

          <div className="section-divider" />

          <div className="login-title">Sign In</div>
          <div className="login-desc">Enter your credentials to access the admin panel.</div>

          {/* Error banner */}
          {errorMsg && (
            <div className="error-banner">
              <div className="error-icon">⚠</div>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="fields">
            {/* Username */}
            <div className="field">
              <label className="field-label" htmlFor="username">Username</label>
              <div className="field-wrap">
                <span className="field-icon">👤</span>
                <input
                  className={`field-input${errorMsg ? " is-error" : ""}`}
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔑</span>
                <input
                  className={`field-input${errorMsg ? " is-error" : ""}`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="pw-footer">
                <label className="show-pw-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={e => setShowPassword(e.target.checked)}
                  />
                  <span className="pw-checkbox">
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3L3.5 5.5L8 1" stroke="#050d1a" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>Show password</span>
                </label>
              </div>
            </div>
          </div>

          <button className="btn-login" type="button" onClick={handleLogin} disabled={loading}>
            <span className={`spinner${loading ? " visible" : ""}`} />
            {!loading && (
              <svg id="btnIcon" width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.85"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            <span>{loading ? "Verifying…" : "Sign In"}</span>
            {!loading && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: 2 }}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
