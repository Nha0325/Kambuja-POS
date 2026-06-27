import { useState, useEffect } from "react"
import { adminManagerService } from "../../../services/adminManager.service"
import formatDate from "../../../utils/formatDate"
import toast from "react-hot-toast"
import { cardClass, inputClass, tableHeadClass, tableHeadCellClass, tableCellClass } from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../components/AdminManagerUi"
import { useConfirm } from "../components/confirm/useConfirm"

function Subscriptions() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [modalType, setModalType] = useState(null) // "renew" | null
  const [selectedShop, setSelectedShop] = useState(null)
  
  const { confirm, closeConfirm } = useConfirm()
  
  const [renewForm, setRenewForm] = useState({
    subscriptionPrice: 0,
    subscriptionStartDate: "",
    subscriptionExpireDate: "",
    subscriptionPaymentStatus: "Paid",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const res = await adminManagerService.getShops()
      if (res.data?.success) {
        setShops(res.data.result)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load subscriptions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleUpdate = async (id, payload, successMessage) => {
    try {
      setIsProcessing(true)
      const res = await adminManagerService.updateShop(id, payload)
      if (res.data?.success) {
        setShops(shops.map(s => s._id === id ? { ...s, ...payload } : s))
        toast.success(successMessage)
        setModalType(null)
        setSelectedShop(null)
      }
    } catch (error) {
      console.error(error)
      toast.error("Action failed")
    } finally {
      setIsProcessing(false)
      closeConfirm()
    }
  }

  const handleSuspend = async (shop) => {
    const ok = await confirm({
      title: "Suspend subscription?",
      message: `Are you sure you want to suspend the subscription for ${shop.name}? This will disable POS access.`,
      confirmText: "Suspend",
      cancelText: "Cancel",
      variant: "danger"
    })
    if (!ok) return
    handleUpdate(shop._id, { subscriptionStatus: "Suspended", posAccess: false }, "Subscription suspended")
  }

  const handleActivate = async (shop) => {
    const ok = await confirm({
      title: "Activate subscription?",
      message: `Are you sure you want to activate the subscription for ${shop.name}? This will enable POS access.`,
      confirmText: "Activate",
      cancelText: "Cancel",
      variant: "primary"
    })
    if (!ok) return
    handleUpdate(shop._id, { subscriptionStatus: "Active", posAccess: true }, "Subscription activated")
  }

  const openRenewModal = (shop) => {
    setSelectedShop(shop)
    const today = new Date().toISOString().split("T")[0]
    let nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    setRenewForm({
      subscriptionPrice: shop.subscriptionPrice || 0,
      subscriptionStartDate: shop.subscriptionStartDate ? shop.subscriptionStartDate.split("T")[0] : today,
      subscriptionExpireDate: shop.subscriptionExpireDate ? shop.subscriptionExpireDate.split("T")[0] : nextMonth.toISOString().split("T")[0],
      subscriptionPaymentStatus: "Paid",
    })
    setModalType("renew")
  }

  const confirmRenew = () => {
    if (!selectedShop) return
    const payload = {
      ...renewForm,
      subscriptionStatus: "Active",
      posAccess: true
    }
    handleUpdate(selectedShop._id, payload, "Subscription renewed successfully")
  }

  const displayedShops = shops.filter(shop => {
    if (shop.isDeleted || shop.status === "ARCHIVED") return false
    const matchSearch = shop.name?.toLowerCase().includes(search.toLowerCase()) || shop.code?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  return (
    <div className="mx-auto w-full max-w-full min-w-0">
      <PageHeader
        title="Subscriptions"
        description="Manage mini market shop plans and access controls."
      />

      <div className="mb-6 p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa] text-[20px]">search</span>
          <input
            className={`${inputClass} pl-10`}
            placeholder="Search by Shop Name or Code..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1200px] table-auto text-left border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop Name</th>
                <th className={tableHeadCellClass}>Owner Admin</th>
                <th className={`${tableHeadCellClass} text-center`}>Plan</th>
                <th className={`${tableHeadCellClass} text-right`}>Price</th>
                <th className={`${tableHeadCellClass} text-right`}>Start Date</th>
                <th className={`${tableHeadCellClass} text-right`}>Expire Date</th>
                <th className={`${tableHeadCellClass} text-center`}>Payment</th>
                <th className={`${tableHeadCellClass} text-center`}>Sub Status</th>
                <th className={`${tableHeadCellClass} text-center`}>POS Access</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {loading ? (
                <TableEmpty colSpan="10">Loading subscriptions...</TableEmpty>
              ) : displayedShops.length === 0 ? (
                <TableEmpty colSpan="10">No subscriptions found.</TableEmpty>
              ) : (
                displayedShops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors group">
                    <td className={tableCellClass}>
                      <div className="font-bold text-[#020617] dark:text-[#f8fafc]">{shop.name}</div>
                      <div className="text-xs text-[#7033ff] font-mono">{shop.code}</div>
                    </td>
                    <td className={tableCellClass}>
                      {shop.ownerAdminId?.username || "Unknown"}
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]">
                        {shop.subscriptionPlan || "Free"}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-right font-bold text-[#020617] dark:text-[#f8fafc]`}>
                      ${Number(shop.subscriptionPrice || 0).toFixed(2)}
                    </td>
                    <td className={`${tableCellClass} text-right text-[#64748b] dark:text-[#a1a1aa]`}>
                      {shop.subscriptionStartDate ? formatDate(shop.subscriptionStartDate, "MMM DD, YYYY") : "-"}
                    </td>
                    <td className={`${tableCellClass} text-right text-[#64748b] dark:text-[#a1a1aa]`}>
                      {shop.subscriptionExpireDate ? formatDate(shop.subscriptionExpireDate, "MMM DD, YYYY") : "-"}
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${shop.subscriptionPaymentStatus === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : shop.subscriptionPaymentStatus === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                        {shop.subscriptionPaymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${shop.subscriptionStatus === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : shop.subscriptionStatus === 'Suspended' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : shop.subscriptionStatus === 'Cancelled' ? 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.subscriptionStatus === 'Active' ? 'bg-emerald-500' : shop.subscriptionStatus === 'Suspended' ? 'bg-amber-500' : shop.subscriptionStatus === 'Cancelled' ? 'bg-[#64748b] dark:bg-[#a1a1aa]' : 'bg-red-500'}`}></span>
                        {shop.subscriptionStatus || "Active"}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${shop.posAccess ? 'bg-[#7033ff]/10 dark:bg-[#7033ff]/20 text-[#7033ff] border border-[#7033ff]/20' : 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.posAccess ? 'bg-[#7033ff]' : 'bg-[#64748b] dark:bg-[#a1a1aa]'}`}></span>
                        {shop.posAccess ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedShop(shop); setModalType("view"); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-[#7033ff] hover:bg-[#7033ff]/10 dark:hover:bg-[#7033ff]/20"
                          title="View Subscription"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {shop.subscriptionStatus === 'Active' ? (
                          <button
                            onClick={() => handleSuspend(shop)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
                            title="Suspend Subscription"
                          >
                            <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(shop)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                            title="Activate Subscription"
                          >
                            <span className="material-symbols-outlined text-[18px]">play_circle</span>
                          </button>
                        )}
                        <button
                          onClick={() => openRenewModal(shop)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-blue-600 hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
                          title="Manual Renew / Payment"
                        >
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType === "renew" && selectedShop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/50 dark:bg-[#020617]/80 backdrop-blur-sm">
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-[#e5e7eb] dark:border-[#27272a]">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7033ff]">payments</span>
                Manual Renew / Payment
              </h3>
              <button 
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">Shop: {selectedShop.name}</p>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">Plan: {selectedShop.subscriptionPlan || "Free"}</p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Price ($)</span>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className={inputClass} 
                    value={renewForm.subscriptionPrice} 
                    onChange={(e) => setRenewForm({...renewForm, subscriptionPrice: e.target.value})}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Start Date</span>
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={renewForm.subscriptionStartDate} 
                    onChange={(e) => setRenewForm({...renewForm, subscriptionStartDate: e.target.value})}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Expire Date</span>
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={renewForm.subscriptionExpireDate} 
                    onChange={(e) => setRenewForm({...renewForm, subscriptionExpireDate: e.target.value})}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Payment Status</span>
                  <select 
                    className={inputClass}
                    value={renewForm.subscriptionPaymentStatus}
                    onChange={(e) => setRenewForm({...renewForm, subscriptionPaymentStatus: e.target.value})}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="h-10 px-6 bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a] font-bold rounded-lg hover:bg-[#e5e7eb] dark:hover:bg-[#27272a] transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRenew}
                className="h-10 px-6 bg-[#7033ff] text-white font-bold rounded-lg hover:bg-[#7033ff]/90 transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Renew"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalType === "view" && selectedShop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/50 dark:bg-[#020617]/80 backdrop-blur-sm">
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-[#e5e7eb] dark:border-[#27272a]">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7033ff]">info</span>
                Subscription Details
              </h3>
              <button 
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Shop Name</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Shop Code</span>
                <span className="text-sm font-mono font-bold text-[#7033ff]">{selectedShop.code}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Plan</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPlan || "Free"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Price</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">${Number(selectedShop.subscriptionPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Start Date</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionStartDate ? formatDate(selectedShop.subscriptionStartDate, "MMM DD, YYYY") : "-"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Expire Date</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionExpireDate ? formatDate(selectedShop.subscriptionExpireDate, "MMM DD, YYYY") : "-"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Payment Status</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPaymentStatus || "Unpaid"}</span>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">POS Access</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.posAccess ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="h-10 px-6 bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a] font-bold rounded-lg hover:bg-[#e5e7eb] dark:hover:bg-[#27272a] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
