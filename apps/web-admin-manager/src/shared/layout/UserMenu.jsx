import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";

export default function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{user?.name}</span>
      <button className="font-medium text-indigo-600" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </div>
  );
}
