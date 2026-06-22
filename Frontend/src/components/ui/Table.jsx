function Table({ children, className = "" }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className={`table min-w-full ${className}`}>{children}</table>
    </div>
  )
}

export default Table
