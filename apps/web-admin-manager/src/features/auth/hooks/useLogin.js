import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const submit = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const result = await login(credentials);
      if (result.user.roleName !== "ADMIN_MANAGER") {
        throw new Error("This application is restricted to ADMIN_MANAGER.");
      }
      setAuth({ token: result.token, user: result.user });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, error, loading };
}
