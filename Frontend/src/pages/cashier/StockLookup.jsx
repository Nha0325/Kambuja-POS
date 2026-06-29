import { useEffect, useState, useMemo } from "react"
import { cashierService } from "../../services/users/cashier.service"
import { getImageUrl } from "../../utils/helpers/getImageUrl"

function StockLookup() {
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
      return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-red-100 text-red-700">Out of Stock</span>
    }
    if (reorderLevel && stock <= reorderLevel) {
      return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-yellow-100 text-yellow-700">Low Stock</span>
    }
    return <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-green-100 text-green-700">In Stock</span>
  }



  return (
    <section className="w-full max-w-full p-4 sm:p-6 bg-[#f8f9ff] min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Lookup</h1>
          <p className="text-sm text-slate-500">Search and view current product inventory</p>
        </div>
        <button 
          onClick={() => {
            setLoading(true)
            cashierService.getProducts().then((response) => {
              setProducts(response.data?.result || response.data?.products || response.data || [])
              setLoading(false)
            }).catch(() => setLoading(false))
          }}
          className="px-4 py-2 bg-white border border-[#d7dced] rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
          className="w-full sm:w-80 px-4 py-2 border border-[#d7dced] rounded-lg text-sm outline-none focus:border-[#0058be]"
        />
      </div>

      <div className="bg-white border border-[#d7dced] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-[#d7dced] text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Sale Price</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7dced]">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              )}
              {!loading && filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      className="w-10 h-10 rounded object-cover border border-slate-200"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                  <td className="px-4 py-3">{product.code}</td>
                  <td className="px-4 py-3 capitalize">{product.category?.name || product.category || "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUsd(product.salePrice)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{product.currentStock || 0}</td>
                  <td className="px-4 py-3 text-center">
                    {getStockStatus(product.currentStock || 0, product.reorderLevel)}
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default StockLookup
