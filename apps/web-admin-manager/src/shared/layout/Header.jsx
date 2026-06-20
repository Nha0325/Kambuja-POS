import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <p className="font-semibold">Platform administration</p>
      <UserMenu />
    </header>
  );
}
