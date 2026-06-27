import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminManagerService } from "../../../services/adminManager.service"
import formatDate from "../../../utils/formatDate"
import {
  FaStore,
  FaUserShield,
  FaUsers,
  FaBoxOpen,
  FaArrowUp,
  FaArrowRight,
  FaCircleCheck,
  FaMoneyBillWave
} from "react-icons/fa6"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"

function Dashboard() {
  const [data, setData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDark, setIsDark] = useState(
    () => typeof window !== "undefined" && window.document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new MutationObserver(() => {
      setIsDark(window.document.documentElement.classList.contains('dark'));
    });
    observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadDashboard = useCallback(() => {
    let isMounted = true
    setIsLoading(true)
    setError("")

    adminManagerService.getDashboard()
      .then((res) => {
        if (!isMounted) return
        setData(res.data.result || {})
      })
      .catch((err) => {
        if (isMounted && err?.response?.status !== 401) {
          setError("Unable to load dashboard")
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => loadDashboard(), [loadDashboard])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 h-[120px] animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-center font-bold">
        Failed to load dashboard data
      </div>
    )
  }

  const formatRiel = (val) => `$${Number(val || 0).toLocaleString()}`

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const platformData = months.map((month, index) => ({
    name: month,
    sales: data.salesRevenueTrend?.[index] || 0,
    subscriptions: data.subscriptionRevenueTrend?.[index] || 0
  }))

  const categories = data.categoryPerformance || []
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

  return (
    <div className="flex flex-col gap-6 text-[#020617] dark:text-[#f8fafc] max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kambuja POS Dashboard</h1>
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">Monitor platform shops, subscriptions, users, and sales performance.</p>
        </div>
        <button onClick={loadDashboard} className="h-10 px-4 bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc] text-sm font-semibold rounded-xl hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors inline-flex items-center justify-center gap-2">
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Shops", value: data.totalShops || 0, sub: "Registered shops", icon: FaStore, color: "text-[#3b82f6]" },
          { label: "Active Shops", value: data.activeShops || 0, sub: "Currently operational", icon: FaCircleCheck, color: "text-[#10b981]" },
          { label: "Total Admins", value: data.totalAdmins || 0, sub: "Across all instances", icon: FaUserShield, color: "text-[#8b5cf6]" },
          { label: "Total Cashiers", value: data.totalCashiers || 0, sub: "Active accounts", icon: FaUsers, color: "text-[#f59e0b]" },
          { label: "Monthly Sales", value: formatRiel(data.monthlySales), sub: "Current month", icon: FaMoneyBillWave, color: "text-[#ef4444]" },
          { label: "Total Products", value: data.totalProducts || 0, sub: "Across platform", icon: FaBoxOpen, color: "text-[#06b6d4]" },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className={`p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                <FaArrowUp /> 0%
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{card.label}</span>
                <span className="text-[10px] text-[#94a3b8] dark:text-[#71717a] truncate">· {card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Platform Performance */}
        <div className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Platform Performance</h3>
            <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Monthly platform performance this year</p>
          </div>
          
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={platformData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e5e7eb"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000)+'k' : val}`} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? "#111113" : "#ffffff",
                  border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
                  borderRadius: "12px",
                  color: isDark ? "#f8fafc" : "#020617",
                  boxShadow: "none"
                }}
                labelStyle={{ color: isDark ? "#f8fafc" : "#020617" }}
                itemStyle={{ color: isDark ? "#f8fafc" : "#020617" }}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(2,6,23,0.04)" }}
                formatter={(value) => formatRiel(value)}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: isDark ? '#a1a1aa' : '#64748b' }} />
              <Line type="monotone" name="Shop Sales Revenue" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Subscription Revenue" dataKey="subscriptions" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Sales by Category</h3>
            <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Product distribution across platform</p>
          </div>
          
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e5e7eb"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? "#111113" : "#ffffff",
                    border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
                    borderRadius: "12px",
                    color: isDark ? "#f8fafc" : "#020617",
                    boxShadow: "none"
                  }}
                  labelStyle={{ color: isDark ? "#f8fafc" : "#020617" }}
                  itemStyle={{ color: isDark ? "#f8fafc" : "#020617" }}
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(2,6,23,0.04)" }}
                />
                <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[320px] text-sm text-[#94a3b8]">No category data available</div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Shop Registrations */}
        <div className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex justify-between items-center bg-white dark:bg-[#111113]">
            <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Recent Shop Registrations</h3>
            <Link to="/admin-manager/shops" className="text-sm font-semibold text-[#7033ff] hover:text-[#5b21b6] dark:hover:text-[#9061f9] flex items-center gap-1">
              View all <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#09090b] border-b border-[#e5e7eb] dark:border-[#27272a]">
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Shop Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                {data.recentShops?.length > 0 ? data.recentShops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-900/50">
                          {shop.name ? shop.name.substring(0, 2).toUpperCase() : "SH"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#020617] dark:text-[#f8fafc]">{shop.name}</p>
                          <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{shop.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-[#64748b] dark:text-[#a1a1aa]">{shop.subscriptionPlan || "Free"}</td>
                    <td className="px-5 py-3 text-sm text-[#64748b] dark:text-[#a1a1aa]">{formatDate(shop.createdAt, "MMM DD, YYYY")}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${shop.status === 'ACTIVE' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                         {shop.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-4 text-center text-[#64748b] dark:text-[#a1a1aa] text-sm">No recent shops</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Admin Owners */}
        <div className="bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex justify-between items-center bg-white dark:bg-[#111113]">
            <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Recent Admin Owners</h3>
            <Link to="/admin-manager/admin-owners" className="text-sm font-semibold text-[#7033ff] hover:text-[#5b21b6] dark:hover:text-[#9061f9] flex items-center gap-1">
              View all <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#09090b] border-b border-[#e5e7eb] dark:border-[#27272a]">
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Admin Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                {data.recentAdmins?.length > 0 ? data.recentAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] flex items-center justify-center font-bold text-xs border border-[#e5e7eb] dark:border-[#27272a]">
                          {admin.username ? admin.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <p className="font-bold text-sm text-[#020617] dark:text-[#f8fafc]">{admin.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{admin.email}</p>
                      {admin.phone && <p className="text-xs text-[#64748b] dark:text-[#71717a]">{admin.phone}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${admin.status === 'ACTIVE' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]'}`}>
                         {admin.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-4 text-center text-[#64748b] dark:text-[#a1a1aa] text-sm">No recent admins</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Dashboard
