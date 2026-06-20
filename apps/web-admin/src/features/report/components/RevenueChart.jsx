import { formatMoney } from "../../../shared/utils/formatMoney";

export default function RevenueChart({ total = 0, today = 0 }) {
  const maximum = Math.max(Number(total), Number(today), 1);
  return <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Revenue</h2>{[["Total", total], ["Today", today]].map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{formatMoney(value)}</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Number(value) / maximum * 100}%` }} /></div></div>)}</div>;
}
