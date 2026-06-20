import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { getTelegramSetting, saveTelegramSetting } from "../services/settingService";

export default function TelegramSettingForm() {
  const [form, setForm] = useState({ chatId: "", enabled: true });
  const [message, setMessage] = useState("");
  useEffect(() => { getTelegramSetting().then((setting) => setForm({ chatId: setting.chatId ?? "", enabled: setting.enabled })).catch(() => undefined); }, []);
  return <form className="grid max-w-xl gap-4 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={async (event) => { event.preventDefault(); await saveTelegramSetting(form); setMessage("Telegram setting saved."); }}><h2 className="font-semibold">Telegram notification</h2><p className="text-sm text-slate-500">The bot token is configured only through the backend TELEGRAM_BOT_TOKEN environment variable.</p><Input label="Chat ID" required value={form.chatId} onChange={(event) => setForm({ ...form, chatId: event.target.value })} /><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />Enabled</label>{message && <p className="text-sm text-emerald-700">{message}</p>}<Button type="submit">Save Telegram setting</Button></form>;
}
