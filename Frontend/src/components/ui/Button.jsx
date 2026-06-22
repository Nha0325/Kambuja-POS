function Button({ className = "", type = "button", children, ...props }) {
  return (
    <button type={type} className={`btn btn-sm ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
