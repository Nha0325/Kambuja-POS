function Input({ label, className = "", ...props }) {
  return (
    <label className="block w-full">
      {label && <span className="block mb-1 text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{label}</span>}
      <input className={`h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500 ${className}`} {...props} />
    </label>
  )
}

export default Input
