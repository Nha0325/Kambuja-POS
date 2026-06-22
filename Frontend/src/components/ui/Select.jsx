function Select({ label, className = "", children, ...props }) {
  return (
    <label className="form-control">
      {label && <span className="mb-1 text-sm">{label}</span>}
      <select className={`select select-bordered ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}

export default Select
