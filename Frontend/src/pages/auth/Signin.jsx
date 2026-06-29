import { useState } from "react";
import useSignin from "../../hooks/auth/useSignin";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { homeForRole } from "../../utils/helpers/role";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF6E5] via-white to-[#E5F5F3]"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap"
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
      `}</style>

      <main className="bg-white p-4 w-full max-w-5xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row min-h-[600px]">
        
        {/* ── Left Panel: Form ── */}
        <section className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <h1 className="text-[32px] font-medium text-gray-900 mb-8 tracking-tight">
              Sign in to Kambuja
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="name@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#18181B] hover:bg-black text-white font-medium py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ── Right Panel: Image ── */}
        <section className="hidden md:block w-1/2 relative rounded-[1.5rem] overflow-hidden">
          <img 
            src="/Logo.jpg" 
            alt="Kambuja POS Logo" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay Box */}
          <div className="absolute bottom-6 left-6 right-6 bg-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Kambuja POS – Systematic control for your enterprise. Access real-time inventory tracking, sales analytics, and multi-store management tools in one secure location.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                System Online
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200">
                v4.2
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default SignIn;
