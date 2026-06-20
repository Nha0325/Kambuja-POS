import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { listShops } from "../../shops/services/shopService";
import { createAdmin } from "../services/adminService";

export default function CreateAdminForm() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({ shopId: "", name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listShops().then(setShops).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message));
  }, []);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <form className="grid max-w-xl gap-4" onSubmit={async (event) => {
      event.preventDefault();
      setLoading(true);
      setError("");
      try {
        await createAdmin(form);
        navigate("/admins");
      } catch (requestError) {
        setError(requestError.response?.data?.message ?? requestError.message);
      } finally {
        setLoading(false);
      }
    }}>
      <Select label="Shop" required value={form.shopId} onChange={update("shopId")}>
        <option value="">Select a shop</option>
        {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
      </Select>
      <Input label="Name" required value={form.name} onChange={update("name")} />
      <Input label="Email" type="email" required value={form.email} onChange={update("email")} />
      <Input label="Password" type="password" minLength="8" required value={form.password} onChange={update("password")} />
      <Input label="Phone" value={form.phone} onChange={update("phone")} />
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create admin"}</Button>
    </form>
  );
}
