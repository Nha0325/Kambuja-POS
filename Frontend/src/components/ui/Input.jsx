function Input({ label, className = "", ...props }) {
  return (
    <label className="form-control">
      {label && <span className="mb-1 text-sm">{label}</span>}
      <input className={`input input-bordered ${className}`} {...props} />
    </label>
  )
}

export default Input
