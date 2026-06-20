import UserMenu from "./UserMenu";

export default function Header({ title = "Shop workspace" }) {
  return <header className="flex justify-between border-b border-slate-200 bg-white px-6 py-4"><p className="font-semibold">{title}</p><UserMenu /></header>;
}
