import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { createCashier } from "../services/cashierService";

export default function CashierForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <form className="grid max-w-xl gap-4" onSubmit={async (event) => { event.preventDefault(); try { await createCashier(form); navigate("/admin/cashiers"); } catch (requestError) { setError(requestError.response?.data?.message ?? requestError.message); } }}><Input label="Name" required value={form.name} onChange={update("name")} /><Input label="Email" type="email" required value={form.email} onChange={update("email")} /><Input label="Password" type="password" minLength="8" required value={form.password} onChange={update("password")} /><Input label="Phone" value={form.phone} onChange={update("phone")} />{error && <p className="text-rose-700">{error}</p>}<Button type="submit">Create cashier</Button></form>;
}
