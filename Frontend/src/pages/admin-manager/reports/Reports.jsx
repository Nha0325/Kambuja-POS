import { useEffect, useRef, useState } from "react"
import { FaDownload, FaChevronDown, FaChartLine, FaMoneyBillWave, FaChartBar, FaStore, FaClock } from "react-icons/fa6"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { downloadCsv } from "../../../utils/helpers/downloadCsv"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import formatDate from "../../../utils/formatters/formatDate"
import { useTranslation } from "react-i18next"


const Combobox = ({ valueObj, onChange, options, placeholder, disabled }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef(null)

  const displayValue = valueObj ? `${valueObj.name} (${valueObj.code})` : ""

  useEffect(() => {
    setSearch(displayValue)
  }, [displayValue])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch(displayValue)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [displayValue])

  const filteredOptions = options.filter(opt => {
    const s = search.toLowerCase()
    return (opt.name && opt.name.toLowerCase().includes(s)) ||
           (opt.code && opt.code.toLowerCase().includes(s))
  })

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] pr-10 pl-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors placeholder:text-[#64748b] dark:placeholder:text-[#a1a1aa] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
          placeholder={placeholder}
          value={search}
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
            if (displayValue && e.target.value !== displayValue) {
              onChange(null) 
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa] pointer-events-none text-xs" />
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg shadow-sm max-h-[240px] overflow-y-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt._id}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${valueObj?._id === opt._id ? 'bg-[#06b6d4]/10 text-[#06b6d4] font-medium' : 'text-[#020617] dark:text-[#f8fafc] hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
              >
                {opt.name} <span className="text-[11px] text-[#64748b] dark:text-[#a1a1aa] ml-1">({opt.code})</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-[#64748b] dark:text-[#a1a1aa] italic">{t('no_results_found')}</div>
          )}
        </div>
      )}
    </div>
  )
}

function Reports() {
  const { t } = useTranslation()
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  
  const [reportData, setReportData] = useState(null)
  const [isLoadingShops, setIsLoadingShops] = useState(true)
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [error, setError] = useState("")

  const [period, setPeriod] = useState("month")
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })

  useEffect(() => {
    setIsLoadingShops(true)
    adminManagerService.getShops()
      .then(res => setShops(res.data?.result || []))
      .catch(err => setError(formatApiError(err) || t('failed_to_load_shops')))
      .finally(() => setIsLoadingShops(false))
  }, [])

  useEffect(() => {
    if (!selectedShop) {
      setReportData(null)
      return
    }

    if (period === 'custom' && (!dateRange.startDate || !dateRange.endDate)) {
        return; 
    }

    setIsLoadingReports(true)
    setError("")
    
    const params = { shopId: selectedShop._id, period }
    if (period === 'custom') {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
    }

    adminManagerService.getReports(params)
      .then((response) => setReportData(response.data.result))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || t('unable_to_load_reports'))
        }
      })
      .finally(() => setIsLoadingReports(false))
  }, [selectedShop, period, dateRange.startDate, dateRange.endDate])

  const exportReports = () => {
    if (!reportData) return;
    downloadCsv(
      `${selectedShop?.code || 'shop'}-report-${period}.csv`,
      [
        { label: t('sale_code'), value: (row) => row.saleCode },
        { label: t('cashier'), value: (row) => row.cashierName },
        { label: t('customer'), value: (row) => row.customerName },
        { label: t('payment'), value: (row) => row.paymentMethod },
        { label: t('total'), value: (row) => Number(row.total || 0) },
        { label: t('status'), value: (row) => row.status },
        { label: t('date'), value: (row) => formatDate(row.createdAt, "MMM DD, YYYY HH:mm") },
      ],
      reportData.recentSales || []
    )
  }

  const formatRiel = (val) => `$${Number(val || 0).toLocaleString()}`

  const trend = reportData?.trend || []

  const categories = reportData?.categoryPerformance || []
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

  return (
    <section className="flex flex-col gap-6 max-w-[1600px] mx-auto text-[#020617] dark:text-[#f8fafc]">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
          <label className="block w-full max-w-[280px]">
            <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('select_shop')}</span>
            <Combobox
              valueObj={selectedShop}
              onChange={setSelectedShop}
              options={shops}
              placeholder={isLoadingShops ? t('loading_shops') : t('search_select_mini_market')}
              disabled={isLoadingShops}
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="block w-full sm:w-[160px]">
              <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('date_range')}</span>
              <select 
                className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px] bg-[right_8px_center] bg-no-repeat" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">{t('today')}</option>
                <option value="week">{t('this_week')}</option>
                <option value="month">{t('this_month')}</option>
                <option value="custom">{t('custom')}</option>
              </select>
            </label>
            {period === 'custom' && (
              <>
                <label className="block w-full sm:w-[140px]">
                  <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('start_date')}</span>
                  <input type="date" className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} />
                </label>
                <label className="block w-full sm:w-[140px]">
                  <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('end_date')}</span>
                  <input type="date" className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} />
                </label>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={exportReports} 
          disabled={!reportData || reportData.recentSales?.length === 0}
          className="h-10 px-4 bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc] text-sm font-semibold rounded-lg hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload className="text-[#64748b] dark:text-[#a1a1aa]" /> {t('export')}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {!selectedShop ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#e5e7eb] dark:border-[#27272a] rounded-xl bg-[#f8fafc]/50 dark:bg-[#09090b]/50">
          <FaStore className="text-4xl text-[#cbd5e1] dark:text-[#334155] mb-4" />
          <p className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('select_shop_to_view_report')}</p>
        </div>
      ) : isLoadingReports && !reportData ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl h-[120px] animate-pulse"></div>)}
        </div>
      ) : reportData?.summary?.totalSales === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#e5e7eb] dark:border-[#27272a] rounded-xl bg-[#f8fafc]/50 dark:bg-[#09090b]/50">
          <FaChartBar className="text-4xl text-[#cbd5e1] dark:text-[#334155] mb-4" />
          <p className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('no_report_data_period')}</p>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: t('total_revenue'), value: formatRiel(reportData?.summary?.totalRevenue), sub: t('selected_period'), icon: FaMoneyBillWave, color: "text-[#10b981]" },
              { label: t('total_sales'), value: (reportData?.summary?.totalSales || 0).toLocaleString(), sub: t('total_transactions'), icon: FaChartLine, color: "text-[#3b82f6]" },
              { label: t('average_sale'), value: formatRiel(reportData?.summary?.averageSale), sub: t('revenue_per_bill'), icon: FaChartBar, color: "text-[#8b5cf6]" },
            ].map((card, i) => (
              <div key={i} className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm">
                <div className="flex justify-between items-start">
                  <div className={`p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{card.label}</span>
                    <span className="text-[10px] text-[#94a3b8] dark:text-[#64748b] truncate">· {card.sub}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm overflow-hidden">
               <div className="flex justify-between items-start">
                  <div className="p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc]">
                    <FaStore className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight truncate" title={reportData?.shop?.name}>{reportData?.shop?.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('status')}</span>
                     <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${reportData?.shop?.status === 'ACTIVE' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                        {reportData?.shop?.status}
                     </span>
                  </div>
                </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Trend Line Chart */}
            <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col h-[420px]">
              <div className="mb-6 h-[48px] shrink-0">
                <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('revenue_trend')}</h3>
                <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('sales_performance_period')}</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000)+'k' : val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => [`${formatRiel(value)} (${props.payload.sales} ${t('sales_count')})`, t('revenue')]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                      <Line type="monotone" name={t('revenue')} dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#94a3b8] dark:text-[#64748b]">{t('no_trend_data')}</div>
                )}
              </div>
            </div>

            {/* Sales by Category Bar Chart */}
            <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col h-[420px]">
              <div className="mb-6 h-[48px] shrink-0">
                <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('sales_by_category')}</h3>
                <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('top_product_categories')}</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                {categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" name={t('products_sold')} radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#94a3b8] dark:text-[#64748b]">{t('no_category_data_available')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex justify-between items-center bg-[#ffffff] dark:bg-[#111113]">
              <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('recent_sales')}</h3>
              <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] flex items-center gap-1"><FaClock /> {t('showing_up_to_100_records')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] dark:bg-[#09090b] border-b border-[#e5e7eb] dark:border-[#27272a]">
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('sale_code')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('cashier')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('customer')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('payment')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('status')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('date')}</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider text-right">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                  {reportData?.recentSales?.map((row) => (
                    <tr key={row.saleCode} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors">
                      <td className="px-5 py-4 text-sm font-medium font-mono text-[#020617] dark:text-[#f8fafc]">{row.saleCode}</td>
                      <td className="px-5 py-4 text-sm text-[#64748b] dark:text-[#a1a1aa]">{row.cashierName}</td>
                      <td className="px-5 py-4 text-sm text-[#64748b] dark:text-[#a1a1aa]">{row.customerName}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">
                            {row.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${row.status === 'paid' || row.status === 'completed' || row.status === 'Completed' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}`}>
                            {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#64748b] dark:text-[#a1a1aa]">{formatDate(row.createdAt, "MMM DD, HH:mm")}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc] text-right">{formatRiel(row.total)}</td>
                    </tr>
                  ))}
                  {reportData?.recentSales?.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-[#94a3b8] dark:text-[#64748b] text-sm">{t('no_recent_sales')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Reports
