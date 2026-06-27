function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block w-full">
      {label && <span className="block mb-1 text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{label}</span>}
      <select className={`h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}

export default Select
