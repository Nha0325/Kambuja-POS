import { useState, useEffect } from "react";
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

  useEffect(() => {
    document.title = "Sign In - Kambuja POS";
  }, []);

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

      <main className="relative bg-white p-4 w-full max-w-5xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row min-h-[600px] overflow-hidden">

        {/* ── Left Panel: Form ── */}
        <section className="relative z-10 w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile Logo (Top watermark effect) */}
            <div className="md:hidden flex justify-center pointer-events-none">
              <img 
                src="/Logo.jpg" 
                alt="Kambuja POS Logo" 
                className="w-full max-w-[280px] object-contain mx-auto"
                style={{ marginBottom: '-70px', zIndex: -1, opacity: 0.9, position: 'relative' }}
              />
            </div>
            
            <h1 className="text-[32px] font-medium text-gray-900 mb-8 tracking-tight text-center md:text-left">
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
        <section className="hidden md:flex w-1/2 flex-col relative rounded-[1.5rem] overflow-hidden bg-white border border-gray-100">
          <div className="absolute inset-0 flex items-center justify-center p-8 pb-48">
            <img 
              src="/Logo.jpg" 
              alt="Kambuja POS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </section>

      </main>
    </div>
  );
};

export default SignIn;
