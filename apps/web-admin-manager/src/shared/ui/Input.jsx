export default function Input({ label, className = "", ...props }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        className={`rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 ${className}`}
        {...props}
      />
    </label>
  );
}
