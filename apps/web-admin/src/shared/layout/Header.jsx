import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ title = "Shop workspace" }) {
  return (
    <header className="flex justify-between border-b border-slate-200 bg-white px-6 py-4">
      <p className="font-semibold">{title}</p>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
