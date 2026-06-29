import { useEffect, useRef, useState } from "react"
import { FaDownload, FaChevronDown, FaChartLine, FaMoneyBillWave, FaChartBar, FaStore, FaClock } from "react-icons/fa6"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { downloadCsv } from "../../../utils/helpers/downloadCsv"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import formatDate from "../../../utils/formatters/formatDate"


const Combobox = ({ valueObj, onChange, options, placeholder, disabled }) => {
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
            <div className="px-3 py-2 text-sm text-[#64748b] dark:text-[#a1a1aa] italic">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

function Reports() {
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
      .catch(err => setError(formatApiError(err) || "Failed to load shops"))
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
          setError(formatApiError(loadError) || "Unable to load reports")
        }
      })
      .finally(() => setIsLoadingReports(false))
  }, [selectedShop, period, dateRange.startDate, dateRange.endDate])

  const exportReports = () => {
    if (!reportData) return;
    downloadCsv(
      `${selectedShop?.code || 'shop'}-report-${period}.csv`,
      [
        { label: "Sale Code", value: (row) => row.saleCode },
        { label: "Cashier", value: (row) => row.cashierName },
        { label: "Customer", value: (row) => row.customerName },
        { label: "Payment", value: (row) => row.paymentMethod },
        { label: "Total", value: (row) => Number(row.total || 0) },
        { label: "Status", value: (row) => row.status },
        { label: "Date", value: (row) => formatDate(row.createdAt, "MMM DD, YYYY HH:mm") },
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
            <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Select Shop</span>
            <Combobox
              valueObj={selectedShop}
              onChange={setSelectedShop}
              options={shops}
              placeholder={isLoadingShops ? "Loading shops..." : "Search or select mini market..."}
              disabled={isLoadingShops}
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="block w-full sm:w-[160px]">
              <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Date Range</span>
              <select 
                className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px] bg-[right_8px_center] bg-no-repeat" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            {period === 'custom' && (
              <>
                <label className="block w-full sm:w-[140px]">
                  <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Start Date</span>
                  <input type="date" className="h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-colors focus:border-[#06b6d4]" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} />
                </label>
                <label className="block w-full sm:w-[140px]">
                  <span className="mb-1.5 block text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">End Date</span>
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
          <FaDownload className="text-[#64748b] dark:text-[#a1a1aa]" /> Export
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
          <p className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">Select a shop to view report</p>
        </div>
      ) : isLoadingReports && !reportData ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl h-[120px] animate-pulse"></div>)}
        </div>
      ) : reportData?.summary?.totalSales === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#e5e7eb] dark:border-[#27272a] rounded-xl bg-[#f8fafc]/50 dark:bg-[#09090b]/50">
          <FaChartBar className="text-4xl text-[#cbd5e1] dark:text-[#334155] mb-4" />
          <p className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">No report data for this period.</p>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Total Revenue", value: formatRiel(reportData?.summary?.totalRevenue), sub: "Selected period", icon: FaMoneyBillWave, color: "text-[#10b981]" },
              { label: "Total Sales", value: (reportData?.summary?.totalSales || 0).toLocaleString(), sub: "Total transactions", icon: FaChartLine, color: "text-[#3b82f6]" },
              { label: "Average Sale", value: formatRiel(reportData?.summary?.averageSale), sub: "Revenue per bill", icon: FaChartBar, color: "text-[#8b5cf6]" },
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
                     <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Status:</span>
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
                <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Revenue Trend</h3>
                <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Sales performance over selected period</p>
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
                        formatter={(value, name, props) => [`${formatRiel(value)} (${props.payload.sales} sales)`, 'Revenue']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                      <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#94a3b8] dark:text-[#64748b]">No trend data</div>
                )}
              </div>
            </div>

            {/* Sales by Category Bar Chart */}
            <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col h-[420px]">
              <div className="mb-6 h-[48px] shrink-0">
                <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Sales by Category</h3>
                <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Top product categories</p>
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
                      <Bar dataKey="value" name="Products Sold" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#94a3b8] dark:text-[#64748b]">No category data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex justify-between items-center bg-[#ffffff] dark:bg-[#111113]">
              <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Recent Sales</h3>
              <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] flex items-center gap-1"><FaClock /> Showing up to 100 records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] dark:bg-[#09090b] border-b border-[#e5e7eb] dark:border-[#27272a]">
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Sale Code</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Cashier</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Payment</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider text-right">Total</th>
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
                      <td colSpan="7" className="px-5 py-8 text-center text-[#94a3b8] dark:text-[#64748b] text-sm">No recent sales</td>
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
