import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { getShop, updateShop } from "../services/shopService";

const empty = { code: "", name: "", ownerUserId: "", phone: "", email: "", address: "", country: "", province: "", city: "", status: "ACTIVE" };

export default function ShopForm() {
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  useEffect(() => { getShop().then(setForm); }, []);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <form className="grid max-w-2xl gap-4 md:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); setForm(await updateShop(form)); setMessage("Shop saved."); }}>{["code", "name", "phone", "email", "address", "country", "province", "city"].map((key) => <Input key={key} label={key.replace(/^\w/, (value) => value.toUpperCase())} required={["code", "name"].includes(key)} value={form[key] ?? ""} onChange={update(key)} />)}{message && <p className="text-sm text-emerald-700">{message}</p>}<Button type="submit" className="md:col-span-2">Save shop</Button></form>;
}
