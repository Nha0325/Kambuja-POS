import { useEffect } from "react"
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { SpeedInsights } from "@vercel/speed-insights/react"
import AppRoutes from "./routes"
import SocketListener from "./components/SocketListener"

function AuthInvalidRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleUnauthorized = () => {
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true })
      }
    }

    window.addEventListener("pos-auth-unauthorized", handleUnauthorized)

    return () => {
      window.removeEventListener("pos-auth-unauthorized", handleUnauthorized)
    }
  }, [location.pathname, navigate])

  return null
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthInvalidRedirect />
        <AppRoutes />
      </BrowserRouter>

      <Toaster position="top-center" />
      <SocketListener />
      <SpeedInsights />
    </>
  );
}

export default App;
