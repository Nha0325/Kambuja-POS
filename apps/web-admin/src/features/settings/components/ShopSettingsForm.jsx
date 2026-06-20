import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import DataTable from "../../../shared/tables/DataTable";
import { listSettings, saveSetting } from "../services/settingService";

export default function ShopSettingsForm() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ type: "GENERAL", key: "", value: "", description: "" });
  useEffect(() => { listSettings().then(setSettings); }, []);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <div className="grid gap-5"><form className="grid gap-3 md:grid-cols-4" onSubmit={async (event) => { event.preventDefault(); const saved = await saveSetting(form); setSettings([...settings.filter((item) => item.key !== saved.key), saved]); }}><Select label="Type" value={form.type} onChange={update("type")}>{["GENERAL", "POS", "INVENTORY", "RECEIPT", "NOTIFICATION"].map((type) => <option key={type}>{type}</option>)}</Select><Input label="Key" required value={form.key} onChange={update("key")} /><Input label="Value" required value={form.value} onChange={update("value")} /><Button type="submit" className="self-end">Save</Button></form><DataTable rows={settings} columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }, { key: "type", label: "Type" }]} /></div>;
}
