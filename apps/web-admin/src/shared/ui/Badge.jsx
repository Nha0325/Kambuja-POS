export default function Badge({ children, tone = "green" }) {
  const tones = { green: "bg-emerald-50 text-emerald-700", red: "bg-rose-50 text-rose-700", blue: "bg-sky-50 text-sky-700" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
