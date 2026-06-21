import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18nStore } from "../../app/i18nStore";

export default function Header() {
  const { t } = useI18nStore();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <p className="font-semibold">{t("title.platform-admin", "Platform administration")}</p>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
