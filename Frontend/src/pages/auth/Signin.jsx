import { useState } from "react";
import useSignin from "../../hooks/auth/useSignin";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { homeForRole } from "../../utils/role";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { signin, isLoading } = useSignin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signin(email, password);
    if (res?.success) {
      navigate(homeForRole(res?.result?.role));
      toast.success("You are signed in successfully!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F8F9FF", fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap');
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
        }
        .login-card {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
          border: 1px solid #E2E8F0;
        }
        .input-field-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #C6C6CD;
          border-radius: 10px;
          padding: 0 16px;
          height: 48px;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field-wrap:focus-within {
          border-color: #2170E4;
          box-shadow: 0 0 0 3px rgba(33,112,228,0.15);
        }
        .input-field-wrap input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 14px;
          color: #0b1c30;
        }
        .input-field-wrap input::placeholder {
          color: #76777d;
        }
        .stat-card {
          padding: 16px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.22);
        }
        .btn-signin {
          width: 100%;
          height: 48px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-signin:hover { opacity: 0.88; }
        .btn-signin:active { transform: scale(0.98); }
        .btn-signin:disabled { opacity: 0.65; cursor: not-allowed; }
        .alt-btn {
          flex: 1;
          height: 40px;
          border: 1px solid #C6C6CD;
          border-radius: 10px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.18s;
        }
        .alt-btn:hover { background: #EFF4FF; }
        .divider-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 16px;
        }
        .divider-line::before,
        .divider-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #C6C6CD;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .left-panel-deco {
          position: absolute;
          bottom: -10%;
          right: -10%;
          opacity: 0.08;
          transform: rotate(12deg);
          font-size: 240px;
          color: #fff;
          pointer-events: none;
        }
      `}</style>

      <main className="login-card flex w-full overflow-hidden"
        style={{
          maxWidth: 1000,
          borderRadius: 16,
          minHeight: 600,
          background: "#fff",
        }}>

        {/* ── Left Panel: Branding ── */}
        <section
          className="hidden md:flex"
          style={{
            width: "50%",
            background: "#2170E4",
            padding: 32,
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}>

          {/* Logo + Name */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 30 }}>point_of_sale</span>
              </div>
              <div>
                <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 20, lineHeight: "28px", margin: 0 }}>
                  Kambuja POS
                </h1>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 }}>Admin Suite v4.2</p>
              </div>
            </div>

            <h2 style={{
              color: "#fff", fontWeight: 700,
              fontSize: 30, lineHeight: "38px",
              letterSpacing: "-0.02em",
              marginBottom: 16, marginTop: 32,
            }}>
              Systematic control<br />for your enterprise.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: "20px", maxWidth: 320 }}>
              Access real-time inventory tracking, sales analytics, and multi-store management tools in one secure location.
            </p>
          </div>

          {/* Stats */}
          {/* <div style={{ position: "relative", zIndex: 10, marginTop: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="stat-card">
                <span className="material-symbols-outlined" style={{ color: "#fff", marginBottom: 4 }}>monitoring</span>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "4px 0 2px" }}>Daily Traffic</p>
                <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: 0 }}>+14.2%</p>
              </div>
              <div className="stat-card">
                <span className="material-symbols-outlined" style={{ color: "#fff", marginBottom: 4 }}>inventory</span>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "4px 0 2px" }}>Stock Level</p>
                <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: 0 }}>98.4%</p>
              </div>
            </div>
          </div> */}

          {/* Decorative Icon */}
          <span className="material-symbols-outlined left-panel-deco">layers</span>
        </section>

        {/* ── Right Panel: Form ── */}
        <section style={{
          width: "100%",
          flex: "1 1 auto",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fff",
        }}>
          <div style={{ maxWidth: 360, margin: "0 auto", width: "100%" }}>

            {/* Mobile Branding */}
            <div className="md:hidden" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, background: "#2170E4",
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 36 }}>point_of_sale</span>
              </div>
              <h1 style={{ fontWeight: 700, fontSize: 20, color: "#0b1c30", margin: 0 }}>Kambuja POS</h1>
            </div>

            {/* Heading */}
            {/* <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 600, fontSize: 20, color: "#0b1c30", margin: "0 0 6px" }}>Sign In</h2>
              <p style={{ color: "#45464d", fontSize: 14, margin: 0 }}>
                Please enter your credentials to access the dashboard.
              </p>
            </div> */}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Email */}
              <div>
                <label htmlFor="email" style={{
                  display: "block", marginBottom: 6,
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase", color: "#45464d",
                }}>
                  Email Address
                </label>
                <div className="input-field-wrap">
                  <span className="material-symbols-outlined" style={{ color: "#76777d", marginRight: 10, fontSize: 20 }}>mail</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label htmlFor="password" style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                    textTransform: "uppercase", color: "#45464d",
                  }}>
                    Password
                  </label>
                  <a href="#" style={{ fontSize: 13, color: "#2170E4", textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.textDecoration = "underline"}
                    onMouseLeave={e => e.target.style.textDecoration = "none"}>
                    Forgot password?
                  </a>
                </div>
                <div className="input-field-wrap">
                  <span className="material-symbols-outlined" style={{ color: "#76777d", marginRight: 10, fontSize: 20 }}>lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#76777d" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  id="remember"
                  type="checkbox"
                  style={{ width: 16, height: 16, borderRadius: 4, cursor: "pointer", accentColor: "#2170E4" }}
                />
                <label htmlFor="remember" style={{ fontSize: 13, color: "#45464d", cursor: "pointer", userSelect: "none" }}>
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-signin" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Login */}
            {/* <div className="divider-line">
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#76777d", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Or Login With
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="alt-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>qr_code_scanner</span>
                <span>Scan QR</span>
              </button>
              <button className="alt-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>passkey</span>
                <span>Passkey</span>
              </button>
            </div> */}

            {/* Footer */}
            {/* <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #C6C6CD", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#45464d", margin: 0 }}>
                New to Kambuja POS?{" "}
                <a href="#" style={{ color: "#2170E4", fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}>
                  Request Access
                </a>
              </p>
            </div> */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignIn;
