import { useEffect, useState, useMemo } from "react"
import { cashierService } from "../../services/users/cashier.service"
import { baseUrl } from "../../utils/config/env"

function StockCheck() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    cashierService.getProducts().then((response) => {
      setProducts(response.data?.result || response.data?.products || response.data || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    return Array.isArray(products) ? products.filter(product =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : []
  }, [products, searchQuery])

  const getStockStatus = (stock, reorderLevel) => {
    if (stock <= 0) {
      return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">Out of Stock</span>
    }
    if (reorderLevel && stock <= reorderLevel) {
      return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-yellow-100 dark:bg-amber-500/10 text-yellow-700 dark:text-amber-400">Low Stock</span>
    }
    return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400">In Stock</span>
  }

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/100x100?text=No+Image"
    if (image.startsWith('http')) return image
    return `${baseUrl}/upload/${image}`
  }

  return (
    <section className="w-full max-w-full p-4 sm:p-6 bg-background text-foreground min-h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Check</h1>
          <p className="text-sm text-muted-foreground">Search and view current product inventory</p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            cashierService.getProducts().then((response) => {
              setProducts(response.data?.result || response.data?.products || response.data || [])
              setLoading(false)
            }).catch(() => setLoading(false))
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold text-card-foreground hover:bg-muted transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Product Name or Code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-border bg-background rounded-lg text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto sidebar-scroll">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-3 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Image</th>
                <th className="px-3 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Product Name</th>
                <th className="hidden sm:table-cell px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Code</th>
                <th className="hidden md:table-cell px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-3 sm:px-4 py-3 font-bold text-right text-muted-foreground uppercase tracking-wider text-[11px]">Sale Price</th>
                <th className="hidden sm:table-cell px-4 py-3 font-bold text-center text-muted-foreground uppercase tracking-wider text-[11px]">Current Stock</th>
                <th className="px-3 sm:px-4 py-3 font-bold text-center text-muted-foreground uppercase tracking-wider text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              )}
              {!loading && filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-muted transition-colors">
                  <td className="px-3 sm:px-4 py-3">
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      className="w-10 h-10 rounded-md object-cover border border-border"
                    />
                  </td>
                  <td className="px-3 sm:px-4 py-3 font-bold text-foreground">{product.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground font-medium">{product.code}</td>
                  <td className="hidden md:table-cell px-4 py-3 capitalize text-muted-foreground font-medium">{product.category?.name || product.category || "-"}</td>
                  <td className="px-3 sm:px-4 py-3 text-right font-bold text-foreground">{formatUsd(product.salePrice)}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-center font-bold text-foreground">{product.currentStock || 0}</td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {getStockStatus(product.currentStock || 0, product.reorderLevel)}
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default StockCheck
