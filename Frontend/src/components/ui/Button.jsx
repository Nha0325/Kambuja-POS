function Button({ className = "", type = "button", children, ...props }) {
  return (
    <button type={type} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
