import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../../utils/config/api"
import formatDate from "../../utils/formatters/formatDate"
import { useTranslation } from "react-i18next";

function SalesHistory() {
  const { t } = useTranslation();
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        const res = await api.get("/sales?limit=100&page=1")
        const fetchedSales = res.data?.result || res.data?.sales || res.data || []
        setSales(Array.isArray(fetchedSales) ? fetchedSales : [])
      } catch (err) {
        setError(err.message || "Failed to fetch sales history")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSales()
  }, [])

  const filteredSales = useMemo(() => {
    if (!search) return sales
    const query = search.toLowerCase()
    return sales.filter(sale =>
      sale.invoiceNumber?.toLowerCase().includes(query) ||
      sale.paymentStatus?.toLowerCase().includes(query) ||
      sale.user?.username?.toLowerCase().includes(query) ||
      sale.cashier?.username?.toLowerCase().includes(query)
    )
  }, [sales, search])

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 sm:p-6 text-foreground">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('sales_history')}</h1>
          <p className="text-sm text-muted-foreground">{t('sales_history_desc')}</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder={t('search_history')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-4 py-2 border border-border bg-background rounded-lg shadow-sm text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-sm">
          {error}
        </div>
      )}


      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto sidebar-scroll">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-2 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] sm:text-[11px]">{t('invoice_id')}</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] sm:text-[11px]">{t('date')}</th>
                <th className="hidden md:table-cell px-2 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] sm:text-[11px]">{t('cashier')}</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] sm:text-[11px]">{t('total_cost')}</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-center text-muted-foreground uppercase tracking-wider text-[10px] sm:text-[11px]">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">{t('loading_sales_history')}</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">{t('no_sales_found')}</td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-muted transition-colors">
                    <td className="px-2 sm:px-4 py-3 font-bold text-primary text-xs sm:text-sm">{sale.invoiceNumber || "-"}</td>
                    <td className="px-2 sm:px-4 py-3 text-muted-foreground font-medium text-xs sm:text-sm">
                      <div className="flex flex-col">
                        <span>{formatDate(sale.createdAt, "DD/MMM/YY")}</span>
                        <span className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">{formatDate(sale.createdAt, "HH:mm")}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-4 py-3 text-muted-foreground capitalize font-medium text-xs sm:text-sm">{sale.user?.username || sale.cashier?.username || "-"}</td>
                    <td className="px-2 sm:px-4 py-3 font-bold text-foreground text-xs sm:text-sm">{formatUsd(sale.totalCost)}</td>
                    <td className="px-2 sm:px-4 py-3 text-center">
                      <Link 
                        to={`/cashier/invoice/${sale._id}`} 
                        className="inline-flex items-center justify-center px-1.5 py-1 sm:px-3 sm:py-1.5 bg-primary text-primary-foreground rounded-md font-bold text-[10px] sm:text-xs hover:bg-primary/90 transition active:scale-95"
                      >
                        {t('receipt')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesHistory
