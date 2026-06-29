import { useState, useEffect } from "react"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { Link } from "react-router-dom"
import formatDate from "../../../utils/formatters/formatDate"
import toast from "react-hot-toast"



import { 
  cardClass, 
  inputClass, 
  selectClass, 
  primaryButtonClass,
  secondaryButtonClass,
  tableHeadClass, 
  tableHeadCellClass, 
  tableCellClass,
  modalClass
} from "../adminManagerUi"
import { PageHeader, TableEmpty, StatusBadge } from "../../../components/admin/AdminManagerUi"
import { useTranslation } from "react-i18next"

function Shops() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [shops, setShops] = useState([])
  const [modalType, setModalType] = useState(null) // "archive" | "delete" | null
  const [selectedShop, setSelectedShop] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { t } = useTranslation()

  const fetchShops = async () => {
    try {
      const res = await adminManagerService.getShops()
      if (res.data?.success) {
        setShops(res.data.result)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const toggleShopStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
      const res = await adminManagerService.updateShopStatus(id, newStatus)
      if (res.data?.success) {
        setShops(shops.map(s => s._id === id ? { ...s, status: newStatus } : s))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleArchiveClick = (shop) => {
    setSelectedShop(shop);
    setModalType("archive");
  }

  const confirmRestore = async () => {
    if (!selectedShop) return;
    try {
      setIsProcessing(true);
      const res = await adminManagerService.restoreShop(selectedShop._id);
      if (res.data?.success) {
        setShops(shops.map(s => s._id === selectedShop._id ? { ...s, status: 'ACTIVE', isDeleted: false } : s));
        setModalType(null);
        setSelectedShop(null);
        toast.success(t('shop_restored_successfully'));
        window.dispatchEvent(new Event("refetchNotifications"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_restore_shop'));
    } finally {
      setIsProcessing(false);
    }
  }

  const confirmArchive = async () => {
    if (!selectedShop) return;
    try {
      setIsProcessing(true);
      const res = await adminManagerService.archiveShop(selectedShop._id);
      if (res.data?.success) {
        setShops(shops.map(s => s._id === selectedShop._id ? { ...s, status: 'ARCHIVED', isDeleted: true } : s));
        setModalType(null);
        setSelectedShop(null);
        toast.success(t('shop_archived_successfully'));
        window.dispatchEvent(new Event("refetchNotifications"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_archive_shop'));
    } finally {
      setIsProcessing(false);
    }
  }

  const displayedShops = shops.filter((shop) => {
    const ownerName = shop.ownerAdminId?.username || ""
    
    const statusMatch = statusFilter === "ALL" 
      ? shop.status !== "ARCHIVED" && !shop.isDeleted
      : shop.status === statusFilter;

    return statusMatch
      && (!search
        || shop.name?.toLowerCase().includes(search.toLowerCase())
        || shop.code?.toLowerCase().includes(search.toLowerCase())
        || ownerName.toLowerCase().includes(search.toLowerCase()))
  })


  return (
    <div className="mx-auto w-full max-w-full min-w-0">
      <PageHeader 
        title={t('shops_directory')} 
        description={t('shops_directory_desc')}
        action={
          <Link
            className={primaryButtonClass}
            to="/admin-manager/shops/create"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {t('create_shop')}
          </Link>
        }
      />

      {/* Filters Bar */}
      <div className={`${cardClass} p-4 flex flex-col lg:flex-row gap-4 items-end lg:items-center mb-6`}>
        {/* Search */}
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa] text-[20px]">search</span>
          <input
            className={`${inputClass} pl-10`}
            placeholder={t('search_shops_placeholder')}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-36">
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{t('all_status')}</option>
              <option value="ACTIVE">{t('active')}</option>
              <option value="LOCKED">{t('locked_inactive')}</option>
              <option value="ARCHIVED">{t('archived')}</option>
            </select>
          </div>
          <button
            className={secondaryButtonClass}
            type="button"
            disabled={displayedShops.length === 0}
          >
            <span className="material-symbols-outlined text-[18px]">download</span> {t('export')}
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] table-auto text-left border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>{t('shop_code')}</th>
                <th className={tableHeadCellClass}>{t('shop_name')}</th>
                <th className={tableHeadCellClass}>{t('owner_admin')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('plan')}</th>
                <th className={`${tableHeadCellClass} text-center`} title={t('cashiers')}>{t('cashiers')}</th>
                <th className={`${tableHeadCellClass} text-center`} title={t('products')}>{t('products')}</th>
                <th className={`${tableHeadCellClass} text-center`} title={t('category')}>{t('category')}</th>
                <th className={`${tableHeadCellClass} text-center`}>{t('status')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('created_date')}</th>
                <th className={`${tableHeadCellClass} text-right`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {displayedShops.length === 0 ? (
                <TableEmpty colSpan="10">{t('no_shops_found')}</TableEmpty>
              ) : (
                displayedShops.map((shop) => {
                  const ownerName = shop.ownerAdminId?.username || t('unknown')
                  return (
                    <tr key={shop._id} className={`group transition-colors ${shop.status === 'LOCKED' ? 'bg-[#f8fafc] dark:bg-[#09090b]' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}>
                      <td className={`${tableCellClass} font-mono text-[#06b6d4]`}>{shop.code}</td>
                      <td className={tableCellClass}>
                        <div className={`font-bold ${shop.status === 'LOCKED' ? 'opacity-60' : ''}`}>{shop.name}</div>
                      </td>
                      <td className={tableCellClass}>
                        <div className={`flex flex-col ${shop.status === 'LOCKED' ? 'opacity-60' : ''}`}>
                          <span>{ownerName}</span>
                          {(() => {
                            const email = shop.ownerAdmin?.email || shop.ownerAdminId?.email || shop.owner?.email || shop.admin?.email
                            return email ? (
                              <a href={`mailto:${email}`} className="text-xs text-blue-600 hover:underline mt-0.5">
                                {email}
                              </a>
                            ) : null
                          })()}
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#64748b] dark:text-[#a1a1aa]">
                          {shop.subscriptionPlan || t('free')}
                        </span>
                      </td>

                      <td className={`${tableCellClass} text-center`} title={t('cashiers')}>
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px] mb-0.5">point_of_sale</span>
                          <span>{shop.cashierCount || 0}</span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`} title={t('products')}>
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px] mb-0.5">inventory_2</span>
                          <span>{shop.productCount || 0}</span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`} title={t('category')}>
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px] mb-0.5">category</span>
                          <span>{shop.categoryCount || shop.categoriesCount || shop.categories?.length || 0}</span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`}>
                        <StatusBadge status={shop.status} />
                      </td>
                      <td className={`${tableCellClass} text-right`}>{formatDate(shop.createdAt, "MMM DD, YYYY")}</td>
                      <td className={`${tableCellClass} text-right`}>
                        <div className="flex items-center justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedShop(shop); setModalType('view'); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-blue-600 hover:bg-blue-600/10 transition-colors" 
                            title={t('view_shop')}
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {shop.status === 'ARCHIVED' ? (
                            <button
                              onClick={() => { setSelectedShop(shop); setModalType('restore'); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-green-600 hover:bg-green-600/10"
                              title={t('restore_shop_btn')}
                            >
                              <span className="material-symbols-outlined text-[18px]">restore</span>
                            </button>
                          ) : (
                            <>
                              <Link to={`/admin-manager/shops/${shop._id}/edit`} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 dark:hover:bg-[#06b6d4]/20 transition-colors" title={t('edit_shop')}>
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <button
                                onClick={() => toggleShopStatus(shop._id, shop.status)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${shop.status === 'ACTIVE' ? 'text-[#64748b] dark:text-[#a1a1aa] hover:text-orange-500 hover:bg-orange-500/10' : 'text-[#64748b] dark:text-[#a1a1aa] hover:text-green-500 hover:bg-green-500/10'}`}
                                title={shop.status === 'ACTIVE' ? t('lock_shop') : t('unlock_shop')}
                              >
                                <span className="material-symbols-outlined text-[18px]">{shop.status === 'ACTIVE' ? 'lock' : 'lock_open'}</span>
                              </button>
                              <button
                                onClick={() => handleArchiveClick(shop)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10"
                                title={t('archive_shop')}
                              >
                                <span className="material-symbols-outlined text-[18px]">archive</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="bg-[#ffffff] dark:bg-[#111113] border-t border-[#e5e7eb] dark:border-[#27272a] px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa]">{t('showing_of_shops', { current: displayedShops.length, total: shops.length })}</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-md bg-[#06b6d4] text-white flex items-center justify-center text-sm font-bold">1</button>
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors text-sm font-bold disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Shop Modal */}
      {modalType === "view" && selectedShop && (
        <div className={modalClass}>
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-xl w-full max-w-lg overflow-hidden border border-[#e5e7eb] dark:border-[#27272a] shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#06b6d4]">storefront</span>
                {t('shop_details')}
              </h3>
              <button 
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:bg-[#f8fafc] dark:hover:bg-[#09090b] hover:text-[#020617] dark:hover:text-[#f8fafc] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('shop_name')}</p>
                  <p className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('shop_code')}</p>
                  <p className="text-sm font-bold text-[#06b6d4] font-mono">{selectedShop.code}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('status')}</p>
                  <StatusBadge status={selectedShop.status} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('subscription_plan')}</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPlan || t('free')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('owner_admin_detail')}</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.ownerAdminId?.username || t('unknown')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('owner_email')}</p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedShop.ownerAdmin?.email || selectedShop.ownerAdminId?.email || selectedShop.owner?.email || selectedShop.admin?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('owner_phone')}</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.ownerAdminId?.phone || selectedShop.billingPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('created_date')}</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{formatDate(selectedShop.createdAt, "MMM DD, YYYY")}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <h4 className="text-sm font-bold text-[#020617] dark:text-[#f8fafc] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">location_on</span>
                  {t('location_address')}
                </h4>
                {!(selectedShop.provinceKh || selectedShop.districtKh || selectedShop.communeKh || selectedShop.village || selectedShop.addressDetail || selectedShop.fullAddressKh) ? (
                  <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] italic bg-[#f8fafc] dark:bg-[#09090b] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] text-center">
                    {t('no_address_added')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-[#f8fafc] dark:bg-[#09090b] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a]">
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('province')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.provinceKh ? `${selectedShop.provinceKh} / ${selectedShop.provinceEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('district')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.districtKh ? `${selectedShop.districtKh} / ${selectedShop.districtEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('commune')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.communeKh ? `${selectedShop.communeKh} / ${selectedShop.communeEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('village')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.village || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('detailed_address')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.addressDetail || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('full_address')}</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc] leading-relaxed">
                        {selectedShop.fullAddressKh ? (
                          <>
                            <span className="block">{selectedShop.fullAddressKh}</span>
                            <span className="block text-[#64748b] dark:text-[#a1a1aa]">{selectedShop.fullAddressEn}</span>
                          </>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => { setModalType(null); setSelectedShop(null); }}
                className={secondaryButtonClass}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {modalType === "archive" && selectedShop && (
        <div className={modalClass}>
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-xl w-full max-w-md overflow-hidden border border-[#e5e7eb] dark:border-[#27272a] shadow-xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto border border-red-200 dark:border-red-900/50">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">archive</span>
              </div>
              <h3 className="text-xl font-bold text-center text-[#020617] dark:text-[#f8fafc] mb-2">{t('archive_shop_title')}</h3>
              <p className="text-[#64748b] dark:text-[#a1a1aa] text-center mb-6">
                {t('archive_shop_desc')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setSelectedShop(null); }}
                  className={secondaryButtonClass}
                  disabled={isProcessing}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmArchive}
                  className="flex-1 h-11 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? t('archiving') : t('archive_shop_title')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {modalType === "restore" && selectedShop && (
        <div className={modalClass}>
          <div className="bg-[#ffffff] dark:bg-[#111113] rounded-xl w-full max-w-md overflow-hidden border border-[#e5e7eb] dark:border-[#27272a] shadow-xl">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto border border-green-200 dark:border-green-900/50">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">restore</span>
              </div>
              <h3 className="text-xl font-bold text-center text-[#020617] dark:text-[#f8fafc] mb-2">{t('restore_shop_title')}</h3>
              <p className="text-[#64748b] dark:text-[#a1a1aa] text-center mb-6">
                {t('restore_shop_desc')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setSelectedShop(null); }}
                  className={secondaryButtonClass}
                  disabled={isProcessing}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmRestore}
                  className="flex-1 h-11 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? t('restoring') : t('restore_shop_title')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shops
