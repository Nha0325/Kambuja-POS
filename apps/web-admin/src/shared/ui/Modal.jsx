export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><header className="mb-4 flex justify-between"><h2 className="font-semibold">{title}</h2><button onClick={onClose}>×</button></header>{children}</section></div>;
}
