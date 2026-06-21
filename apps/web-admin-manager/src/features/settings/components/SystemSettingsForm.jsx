import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { listSettings, saveSettings } from "../services/settingService";
import { useSettingStore } from "../store/settingStore";
import { useI18nStore } from "../../../app/i18nStore";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a {key: value} map from the settings array returned by the API */
function toMap(settings) {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

/** Convert a {key: value} map back to SettingRequest array */
function toRequests(map, meta) {
  return Object.entries(map).map(([key, value]) => ({
    type: meta[key]?.type ?? "GENERAL",
    key,
    value: String(value),
    description: meta[key]?.description ?? "",
  }));
}

// ─── Setting metadata: key → {type, description} ───────────────────────────
const SETTING_META = {
  // GENERAL
  systemName:               { type: "GENERAL",      description: "System display name" },
  defaultLanguage:          { type: "GENERAL",      description: "Default UI language (km/en)" },
  currency:                 { type: "GENERAL",      description: "Currency code e.g. KHR, USD" },
  timezone:                 { type: "GENERAL",      description: "System timezone" },
  // SHOP / LOCATION
  shopCodePrefix:           { type: "GENERAL",      description: "Shop code prefix" },
  defaultProvinceCity:      { type: "GENERAL",      description: "Default province/city" },
  enableMultiShop:          { type: "GENERAL",      description: "Allow multiple shops" },
  // POS
  saleNumberPrefix:         { type: "POS",          description: "Prefix for sale numbers" },
  receiptNumberPrefix:      { type: "POS",          description: "Prefix for receipt numbers" },
  allowDiscount:            { type: "POS",          description: "Allow discount on sales" },
  allowReturnRefund:        { type: "POS",          description: "Allow return/refund" },
  lowStockAlertQuantity:    { type: "INVENTORY",    description: "Alert threshold for low stock" },
  // RECEIPT
  receiptTitle:             { type: "RECEIPT",      description: "Receipt header title" },
  receiptFooterText:        { type: "RECEIPT",      description: "Receipt footer text" },
  showCashierName:          { type: "RECEIPT",      description: "Show cashier name on receipt" },
  showShopAddress:          { type: "RECEIPT",      description: "Show shop address on receipt" },
  showShopPhone:            { type: "RECEIPT",      description: "Show shop phone on receipt" },
  // PAYMENT
  enableCashPayment:        { type: "POS",          description: "Enable cash payment method" },
  enableBankTransfer:       { type: "POS",          description: "Enable bank transfer payment" },
  enableQrPayment:          { type: "POS",          description: "Enable QR code payment" },
  defaultPaymentMethod:     { type: "POS",          description: "Default payment method" },
  // INVENTORY
  autoDecreaseStockAfterSale: { type: "INVENTORY",  description: "Auto reduce stock on sale" },
  allowSaleWhenOutOfStock:  { type: "INVENTORY",    description: "Allow sale with zero stock" },
  enableLowStockNotification: { type: "INVENTORY",  description: "Notify when stock is low" },
  // NOTIFICATION
  enableTelegram:           { type: "NOTIFICATION", description: "Enable Telegram notifications" },
  telegramBotToken:         { type: "NOTIFICATION", description: "Telegram bot token" },
  telegramChatId:           { type: "NOTIFICATION", description: "Telegram chat/group ID" },
  enableDailySalesReport:   { type: "NOTIFICATION", description: "Send daily sales report" },
  // SECURITY
  sessionTimeoutMinutes:    { type: "GENERAL",      description: "Session timeout in minutes" },
  passwordMinLength:        { type: "GENERAL",      description: "Minimum password length" },
  loginAttemptLimit:        { type: "GENERAL",      description: "Max failed login attempts" },
  // BACKUP
  enableAutoBackup:         { type: "GENERAL",      description: "Enable automatic backup" },
  backupSchedule:           { type: "GENERAL",      description: "Backup schedule (cron or label)" },
};

const DEFAULTS = {
  systemName: "Kambuja POS",
  defaultLanguage: "km",
  currency: "KHR",
  timezone: "Asia/Phnom_Penh",
  shopCodePrefix: "KFP-SHOP",
  defaultProvinceCity: "",
  enableMultiShop: "true",
  saleNumberPrefix: "SALE",
  receiptNumberPrefix: "RCP",
  allowDiscount: "true",
  allowReturnRefund: "true",
  lowStockAlertQuantity: "5",
  receiptTitle: "Kambuja POS",
  receiptFooterText: "Thank you for your purchase!",
  showCashierName: "true",
  showShopAddress: "true",
  showShopPhone: "true",
  enableCashPayment: "true",
  enableBankTransfer: "true",
  enableQrPayment: "true",
  defaultPaymentMethod: "CASH",
  autoDecreaseStockAfterSale: "true",
  allowSaleWhenOutOfStock: "false",
  enableLowStockNotification: "true",
  enableTelegram: "false",
  telegramBotToken: "",
  telegramChatId: "",
  enableDailySalesReport: "false",
  sessionTimeoutMinutes: "60",
  passwordMinLength: "8",
  loginAttemptLimit: "5",
  enableAutoBackup: "false",
  backupSchedule: "daily",
};

// ─── Reusable section wrapper ────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="text-lg">{icon}</span>
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="grid gap-4 p-5">{children}</div>
    </div>
  );
}

// Toggle switch for boolean settings
function Toggle({ label, desc, value, onChange }) {
  const on = value === "true";
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(on ? "false" : "true")}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </label>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function SystemSettingsForm() {
  const { settings, setSettings } = useSettingStore();
  const { t } = useI18nStore();

  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load settings and merge into form
  useEffect(() => {
    listSettings().then((data) => {
      setSettings(data);
      setForm((prev) => ({ ...prev, ...toMap(data) }));
    });
  }, [setSettings]);

  const set = (key) => (val) =>
    setForm((prev) => ({ ...prev, [key]: val }));
  const setEv = (key) => (e) => set(key)(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const requests = toRequests(form, SETTING_META);
      const updated = await saveSettings(requests);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 pb-10">

      {/* ── 1. General ── */}
      <Section title={t("settings.section.general", "General Settings")} icon="⚙️">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("settings.systemName", "System Name")} value={form.systemName} onChange={setEv("systemName")} />
          <Select label={t("settings.defaultLanguage", "Default Language")} value={form.defaultLanguage} onChange={setEv("defaultLanguage")}>
            <option value="km">ខ្មែរ (Khmer)</option>
            <option value="en">English</option>
          </Select>
          <Input label={t("settings.currency", "Currency")} value={form.currency} onChange={setEv("currency")} placeholder="KHR / USD" />
          <Input label={t("settings.timezone", "Timezone")} value={form.timezone} onChange={setEv("timezone")} placeholder="Asia/Phnom_Penh" />
        </div>
      </Section>

      {/* ── 2. Shop / Location ── */}
      <Section title={t("settings.section.shop", "Shop / Location Settings")} icon="🏪">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("settings.shopCodePrefix", "Shop Code Prefix")} value={form.shopCodePrefix} onChange={setEv("shopCodePrefix")} placeholder="KFP-SHOP" />
          <Input label={t("settings.defaultProvinceCity", "Default Province/City")} value={form.defaultProvinceCity} onChange={setEv("defaultProvinceCity")} />
        </div>
        <Toggle label={t("settings.enableMultiShop", "Enable Multi-Shop")} desc={t("settings.enableMultiShop.desc", "Allow platform to manage multiple shops")} value={form.enableMultiShop} onChange={set("enableMultiShop")} />
      </Section>

      {/* ── 3. POS ── */}
      <Section title={t("settings.section.pos", "POS Settings")} icon="🧾">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("settings.saleNumberPrefix", "Sale Number Prefix")} value={form.saleNumberPrefix} onChange={setEv("saleNumberPrefix")} placeholder="SALE" />
          <Input label={t("settings.receiptNumberPrefix", "Receipt Number Prefix")} value={form.receiptNumberPrefix} onChange={setEv("receiptNumberPrefix")} placeholder="RCP" />
          <Input label={t("settings.lowStockAlertQuantity", "Low Stock Alert Qty")} type="number" min="0" value={form.lowStockAlertQuantity} onChange={setEv("lowStockAlertQuantity")} />
        </div>
        <div className="grid gap-3">
          <Toggle label={t("settings.allowDiscount", "Allow Discount")} value={form.allowDiscount} onChange={set("allowDiscount")} />
          <Toggle label={t("settings.allowReturnRefund", "Allow Return / Refund")} value={form.allowReturnRefund} onChange={set("allowReturnRefund")} />
        </div>
      </Section>

      {/* ── 4. Receipt ── */}
      <Section title={t("settings.section.receipt", "Receipt Settings")} icon="🖨️">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("settings.receiptTitle", "Receipt Title")} value={form.receiptTitle} onChange={setEv("receiptTitle")} />
          <Input label={t("settings.receiptFooterText", "Receipt Footer")} value={form.receiptFooterText} onChange={setEv("receiptFooterText")} />
        </div>
        <div className="grid gap-3">
          <Toggle label={t("settings.showCashierName", "Show Cashier Name")} value={form.showCashierName} onChange={set("showCashierName")} />
          <Toggle label={t("settings.showShopAddress", "Show Shop Address")} value={form.showShopAddress} onChange={set("showShopAddress")} />
          <Toggle label={t("settings.showShopPhone", "Show Shop Phone")} value={form.showShopPhone} onChange={set("showShopPhone")} />
        </div>
      </Section>

      {/* ── 5. Payment ── */}
      <Section title={t("settings.section.payment", "Payment Settings")} icon="💳">
        <Select label={t("settings.defaultPaymentMethod", "Default Payment Method")} value={form.defaultPaymentMethod} onChange={setEv("defaultPaymentMethod")}>
          <option value="CASH">{t("pos.cash", "Cash")}</option>
          <option value="BANK_TRANSFER">{t("settings.bankTransfer", "Bank Transfer")}</option>
          <option value="QR">{t("pos.qr", "QR Code")}</option>
        </Select>
        <div className="grid gap-3">
          <Toggle label={t("settings.enableCashPayment", "Enable Cash Payment")} value={form.enableCashPayment} onChange={set("enableCashPayment")} />
          <Toggle label={t("settings.enableBankTransfer", "Enable Bank Transfer")} value={form.enableBankTransfer} onChange={set("enableBankTransfer")} />
          <Toggle label={t("settings.enableQrPayment", "Enable QR Payment")} value={form.enableQrPayment} onChange={set("enableQrPayment")} />
        </div>
      </Section>

      {/* ── 6. Inventory ── */}
      <Section title={t("settings.section.inventory", "Inventory Settings")} icon="📦">
        <div className="grid gap-3">
          <Toggle label={t("settings.autoDecreaseStockAfterSale", "Auto Decrease Stock After Sale")} value={form.autoDecreaseStockAfterSale} onChange={set("autoDecreaseStockAfterSale")} />
          <Toggle label={t("settings.allowSaleWhenOutOfStock", "Allow Sale When Out of Stock")} value={form.allowSaleWhenOutOfStock} onChange={set("allowSaleWhenOutOfStock")} />
          <Toggle label={t("settings.enableLowStockNotification", "Enable Low Stock Notification")} value={form.enableLowStockNotification} onChange={set("enableLowStockNotification")} />
        </div>
      </Section>

      {/* ── 7. Notification ── */}
      <Section title={t("settings.section.notification", "Notification Settings")} icon="🔔">
        <div className="grid gap-3">
          <Toggle label={t("settings.enableTelegram", "Enable Telegram Notifications")} value={form.enableTelegram} onChange={set("enableTelegram")} />
          <Toggle label={t("settings.enableDailySalesReport", "Daily Sales Report")} value={form.enableDailySalesReport} onChange={set("enableDailySalesReport")} />
        </div>
        {form.enableTelegram === "true" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t("settings.telegramBotToken", "Telegram Bot Token")} value={form.telegramBotToken} onChange={setEv("telegramBotToken")} placeholder="123456:ABC-..." />
            <Input label={t("settings.telegramChatId", "Telegram Chat ID")} value={form.telegramChatId} onChange={setEv("telegramChatId")} placeholder="-100..." />
          </div>
        )}
      </Section>

      {/* ── 8. Security ── */}
      <Section title={t("settings.section.security", "Security Settings")} icon="🔒">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t("settings.sessionTimeoutMinutes", "Session Timeout (min)")} type="number" min="1" value={form.sessionTimeoutMinutes} onChange={setEv("sessionTimeoutMinutes")} />
          <Input label={t("settings.passwordMinLength", "Min Password Length")} type="number" min="4" value={form.passwordMinLength} onChange={setEv("passwordMinLength")} />
          <Input label={t("settings.loginAttemptLimit", "Login Attempt Limit")} type="number" min="1" value={form.loginAttemptLimit} onChange={setEv("loginAttemptLimit")} />
        </div>
      </Section>

      {/* ── 9. Backup ── */}
      <Section title={t("settings.section.backup", "Backup Settings")} icon="💾">
        <Toggle label={t("settings.enableAutoBackup", "Enable Auto Backup")} value={form.enableAutoBackup} onChange={set("enableAutoBackup")} />
        {form.enableAutoBackup === "true" && (
          <Select label={t("settings.backupSchedule", "Backup Schedule")} value={form.backupSchedule} onChange={setEv("backupSchedule")}>
            <option value="daily">{t("settings.backupSchedule.daily", "Daily")}</option>
            <option value="weekly">{t("settings.backupSchedule.weekly", "Weekly")}</option>
            <option value="monthly">{t("settings.backupSchedule.monthly", "Monthly")}</option>
          </Select>
        )}
        <div>
          <p className="mb-2 text-xs text-slate-400">{t("settings.exportDatabase.desc", "Manual export is not yet available from this panel.")}</p>
          <Button type="button" className="bg-slate-100 text-slate-600 hover:bg-slate-200" disabled>
            {t("settings.exportDatabase", "Export Database")}
          </Button>
        </div>
      </Section>

      {/* ── Save bar ── */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? t("common.loading", "Saving...") : t("settings.saveSettings", "Save Settings")}
        </Button>
        {saved && (
          <span className="text-sm font-medium text-emerald-600">
            ✓ {t("settings.saved", "Settings saved")}
          </span>
        )}
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
    </form>
  );
}
