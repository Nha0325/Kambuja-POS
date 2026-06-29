import { useState, useEffect } from "react"
import { adminManagerService } from "../../../services/users/adminManager.service"
import formatDate from "../../../utils/formatters/formatDate"
import toast from "react-hot-toast"
import { cardClass, inputClass, tableHeadClass, tableHeadCellClass, tableCellClass } from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../../../components/admin/AdminManagerUi"
import { useConfirm } from "../../../hooks/ui/useConfirm"
import { useTranslation } from "react-i18next"

function Subscriptions() {
  const { t } = useTranslation()
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const res = await adminManagerService.getShops()
      if (res.data?.success) {
        setShops(res.data.result)
      }
    } catch (error) {
      console.error(error)
      toast.error(t('failed_to_load_subscriptions'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

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
      toast.error(t('action_failed'))
    } finally {
      setIsProcessing(false)
      closeConfirm()
    }
  }

  const handleSuspend = async (shop) => {
    const ok = await confirm({
      title: t('suspend_subscription_title'),
      message: t('suspend_subscription_desc', { name: shop.name }),
      confirmText: t('suspend'),
      cancelText: t('cancel'),
      variant: "danger"
    })
    if (!ok) return
    handleUpdate(shop._id, { subscriptionStatus: "Suspended", posAccess: false }, t('subscription_suspended'))
  }

  const handleActivate = async (shop) => {
    const ok = await confirm({
      title: t('activate_subscription_title'),
      message: t('activate_subscription_desc', { name: shop.name }),
      confirmText: t('activate'),
      cancelText: t('cancel'),
      variant: "primary"
    })
    if (!ok) return
    handleUpdate(shop._id, { subscriptionStatus: "Active", posAccess: true }, t('subscription_activated'))
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
    handleUpdate(selectedShop._id, payload, t('subscription_renewed_success'))
  }

  const displayedShops = shops.filter(shop => {
    if (shop.isDeleted || shop.status === "ARCHIVED") return false
    const matchSearch = shop.name?.toLowerCase().includes(search.toLowerCase()) || shop.code?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  return (
    <div className="mx-auto w-full max-w-full min-w-0">
      <PageHeader
        title={t('subscriptions')}
        description={t('manage_mini_market_shop_plans')}
      />

      <div className="mb-6 p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa] text-[20px]">search</span>
          <input
            className={`${inputClass} pl-10`}
            placeholder={t('search_by_shop_name_or_code')}
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
                <th className={tableHeadCellClass}>{t('shop_name')}</th>
                <th className={tableHeadCellClass}>{t('owner_admin')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('plan')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('price')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('start_date')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('expire_date')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('payment')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('sub_status')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('pos_access')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {loading ? (
                <TableEmpty colSpan="10">{t('loading_subscriptions')}</TableEmpty>
              ) : displayedShops.length === 0 ? (
                <TableEmpty colSpan="10">{t('no_subscriptions_found')}</TableEmpty>
              ) : (
                displayedShops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors group">
                    <td className={tableCellClass}>
                      <div className="font-bold text-[#020617] dark:text-[#f8fafc]">{shop.name}</div>
                      <div className="text-xs text-[#06b6d4] font-mono">{shop.code}</div>
                    </td>
                    <td className={tableCellClass}>
                      {shop.ownerAdminId?.username || t('unknown')}
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]">
                        {shop.subscriptionPlan || t('free')}
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
                        {shop.subscriptionPaymentStatus === 'Paid' ? t('paid') : shop.subscriptionPaymentStatus === 'Pending' ? t('pending') : t('unpaid')}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${shop.subscriptionStatus === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : shop.subscriptionStatus === 'Suspended' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : shop.subscriptionStatus === 'Cancelled' ? 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.subscriptionStatus === 'Active' ? 'bg-emerald-500' : shop.subscriptionStatus === 'Suspended' ? 'bg-amber-500' : shop.subscriptionStatus === 'Cancelled' ? 'bg-[#64748b] dark:bg-[#a1a1aa]' : 'bg-red-500'}`}></span>
                        {shop.subscriptionStatus === 'Active' ? t('active') : shop.subscriptionStatus === 'Suspended' ? t('suspended') : shop.subscriptionStatus === 'Cancelled' ? t('cancelled') : t('active')}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${shop.posAccess ? 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/20' : 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.posAccess ? 'bg-[#06b6d4]' : 'bg-[#64748b] dark:bg-[#a1a1aa]'}`}></span>
                        {shop.posAccess ? t('enabled') : t('disabled')}
                      </span>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedShop(shop); setModalType("view"); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 dark:hover:bg-[#06b6d4]/20"
                          title={t('view_subscription')}
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {shop.subscriptionStatus === 'Active' ? (
                          <button
                            onClick={() => handleSuspend(shop)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
                            title={t('suspend_subscription')}
                          >
                            <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(shop)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                            title={t('activate_subscription')}
                          >
                            <span className="material-symbols-outlined text-[18px]">play_circle</span>
                          </button>
                        )}
                        <button
                          onClick={() => openRenewModal(shop)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-blue-600 hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
                          title={t('manual_renew_payment')}
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
                <span className="material-symbols-outlined text-[#06b6d4]">payments</span>
                {t('manual_renew_payment')}
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
                <p className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{t('shop_label')} {selectedShop.name}</p>
                <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{t('plan_label')} {selectedShop.subscriptionPlan || t('free')}</p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">{t('price_usd')}</span>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">{t('start_date')}</span>
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={renewForm.subscriptionStartDate} 
                    onChange={(e) => setRenewForm({...renewForm, subscriptionStartDate: e.target.value})}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">{t('expire_date')}</span>
                  <input 
                    type="date" 
                    className={inputClass} 
                    value={renewForm.subscriptionExpireDate} 
                    onChange={(e) => setRenewForm({...renewForm, subscriptionExpireDate: e.target.value})}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">{t('payment_status')}</span>
                  <select 
                    className={inputClass}
                    value={renewForm.subscriptionPaymentStatus}
                    onChange={(e) => setRenewForm({...renewForm, subscriptionPaymentStatus: e.target.value})}
                  >
                    <option value="Paid">{t('paid')}</option>
                    <option value="Unpaid">{t('unpaid')}</option>
                    <option value="Pending">{t('pending')}</option>
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
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmRenew}
                className="h-10 px-6 bg-[#06b6d4] text-white font-bold rounded-lg hover:bg-[#06b6d4]/90 transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? t('processing') : t('confirm_renew')}
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
                <span className="material-symbols-outlined text-[#06b6d4]">info</span>
                {t('subscription_details')}
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
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('shop_name')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('shop_code')}</span>
                <span className="text-sm font-mono font-bold text-[#06b6d4]">{selectedShop.code}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('plan')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPlan || t('free')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('price')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">${Number(selectedShop.subscriptionPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('start_date')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionStartDate ? formatDate(selectedShop.subscriptionStartDate, "MMM DD, YYYY") : "-"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('expire_date')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionExpireDate ? formatDate(selectedShop.subscriptionExpireDate, "MMM DD, YYYY") : "-"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#27272a] pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('payment_status')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPaymentStatus || t('unpaid')}</span>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('pos_access')}</span>
                <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.posAccess ? t('enabled') : t('disabled')}</span>
              </div>
            </div>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="h-10 px-6 bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a] font-bold rounded-lg hover:bg-[#e5e7eb] dark:hover:bg-[#27272a] transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
