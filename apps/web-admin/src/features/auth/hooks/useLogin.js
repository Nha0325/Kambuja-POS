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
      if (!["ADMIN", "CASHIER"].includes(result.user.roleName)) throw new Error("This application is restricted to ADMIN and CASHIER.");
      setAuth({ token: result.token, user: result.user });
      navigate(result.user.roleName === "ADMIN" ? "/admin/dashboard" : "/pos/sale", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message);
    } finally {
      setLoading(false);
    }
  };
  return { submit, error, loading };
}
