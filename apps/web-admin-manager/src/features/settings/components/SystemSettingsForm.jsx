import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import DataTable from "../../../shared/tables/DataTable";
import { listSettings, saveSetting } from "../services/settingService";
import { useSettingStore } from "../store/settingStore";

export default function SystemSettingsForm() {
  const settings = useSettingStore((state) => state.settings);
  const setSettings = useSettingStore((state) => state.setSettings);
  const [form, setForm] = useState({ type: "GENERAL", key: "", value: "", description: "" });
  useEffect(() => { listSettings().then(setSettings); }, [setSettings]);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <div className="grid gap-6">
      <form className="grid max-w-xl gap-4" onSubmit={async (event) => { event.preventDefault(); const saved = await saveSetting(form); setSettings([...settings.filter((item) => item.key !== saved.key), saved]); setForm({ ...form, key: "", value: "", description: "" }); }}>
        <Select label="Type" value={form.type} onChange={update("type")}>{["GENERAL", "POS", "INVENTORY", "RECEIPT", "NOTIFICATION"].map((type) => <option key={type}>{type}</option>)}</Select>
        <Input label="Key" required value={form.key} onChange={update("key")} />
        <Input label="Value" required value={form.value} onChange={update("value")} />
        <Input label="Description" value={form.description} onChange={update("description")} />
        <Button type="submit">Save setting</Button>
      </form>
      <DataTable rows={settings} columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }, { key: "type", label: "Type" }]} />
    </div>
  );
}
