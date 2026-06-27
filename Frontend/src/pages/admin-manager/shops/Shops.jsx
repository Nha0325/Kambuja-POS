import { useState, useEffect } from "react"
import { adminManagerService } from "../../../services/adminManager.service"
import { Link } from "react-router-dom"
import formatDate from "../../../utils/formatDate"
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
import { PageHeader, TableEmpty, StatusBadge } from "../components/AdminManagerUi"

function Shops() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [shops, setShops] = useState([])
  const [modalType, setModalType] = useState(null) // "archive" | "delete" | null
  const [selectedShop, setSelectedShop] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

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
        toast.success("Shop restored successfully");
        window.dispatchEvent(new Event("refetchNotifications"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to restore shop");
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
        toast.success("Shop archived successfully");
        window.dispatchEvent(new Event("refetchNotifications"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive shop");
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
        title="Shops Directory" 
        description="Manage business accounts, tenants, and their platform access."
        action={
          <Link
            className={primaryButtonClass}
            to="/admin-manager/shops/create"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Shop
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
            placeholder="Search by Shop Name, Code, or Owner..."
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
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="LOCKED">Locked/Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <button
            className={secondaryButtonClass}
            type="button"
            disabled={displayedShops.length === 0}
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] table-auto text-left border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop Code</th>
                <th className={tableHeadCellClass}>Shop Name</th>
                <th className={tableHeadCellClass}>Owner / Admin</th>
                <th className={`${tableHeadCellClass} text-center`}>Plan</th>
                <th className={`${tableHeadCellClass} text-center`} title="Cashiers">Cashiers</th>
                <th className={`${tableHeadCellClass} text-center`} title="Products">Products</th>
                <th className={`${tableHeadCellClass} text-center`} title="Category">Category</th>
                <th className={`${tableHeadCellClass} text-center`}>Status</th>
                <th className={`${tableHeadCellClass} text-right`}>Created Date</th>
                <th className={`${tableHeadCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {displayedShops.length === 0 ? (
                <TableEmpty colSpan="10">No shops found matching your search.</TableEmpty>
              ) : (
                displayedShops.map((shop) => {
                  const ownerName = shop.ownerAdminId?.username || "Unknown"
                  return (
                    <tr key={shop._id} className={`group transition-colors ${shop.status === 'LOCKED' ? 'bg-[#f8fafc] dark:bg-[#09090b]' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}>
                      <td className={`${tableCellClass} font-mono text-[#7033ff]`}>{shop.code}</td>
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
                          {shop.subscriptionPlan || "Free"}
                        </span>
                      </td>

                      <td className={`${tableCellClass} text-center`} title="Cashiers">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px] mb-0.5">point_of_sale</span>
                          <span>{shop.cashierCount || 0}</span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`} title="Products">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px] mb-0.5">inventory_2</span>
                          <span>{shop.productCount || 0}</span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-center`} title="Category">
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
                            title="View Shop"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {shop.status === 'ARCHIVED' ? (
                            <button
                              onClick={() => { setSelectedShop(shop); setModalType('restore'); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-green-600 hover:bg-green-600/10"
                              title="Restore Shop"
                            >
                              <span className="material-symbols-outlined text-[18px]">restore</span>
                            </button>
                          ) : (
                            <>
                              <Link to={`/admin-manager/shops/${shop._id}/edit`} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] hover:text-[#7033ff] hover:bg-[#7033ff]/10 dark:hover:bg-[#7033ff]/20 transition-colors" title="Edit Shop">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <button
                                onClick={() => toggleShopStatus(shop._id, shop.status)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${shop.status === 'ACTIVE' ? 'text-[#64748b] dark:text-[#a1a1aa] hover:text-orange-500 hover:bg-orange-500/10' : 'text-[#64748b] dark:text-[#a1a1aa] hover:text-green-500 hover:bg-green-500/10'}`}
                                title={shop.status === 'ACTIVE' ? 'Lock Shop' : 'Unlock Shop'}
                              >
                                <span className="material-symbols-outlined text-[18px]">{shop.status === 'ACTIVE' ? 'lock' : 'lock_open'}</span>
                              </button>
                              <button
                                onClick={() => handleArchiveClick(shop)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[#64748b] dark:text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10"
                                title="Archive Shop"
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
          <span className="text-sm font-bold text-[#64748b] dark:text-[#a1a1aa]">Showing {displayedShops.length} of {shops.length} shops</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-md border border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-md bg-[#7033ff] text-white flex items-center justify-center text-sm font-bold">1</button>
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
                <span className="material-symbols-outlined text-[#7033ff]">storefront</span>
                Shop Details
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
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Shop Name</p>
                  <p className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{selectedShop.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Shop Code</p>
                  <p className="text-sm font-bold text-[#7033ff] font-mono">{selectedShop.code}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedShop.status} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Subscription Plan</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.subscriptionPlan || "Free"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Owner Admin</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.ownerAdminId?.username || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Owner Email</p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedShop.ownerAdmin?.email || selectedShop.ownerAdminId?.email || selectedShop.owner?.email || selectedShop.admin?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Owner Phone</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.ownerAdminId?.phone || selectedShop.billingPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Created Date</p>
                  <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{formatDate(selectedShop.createdAt, "MMM DD, YYYY")}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <h4 className="text-sm font-bold text-[#020617] dark:text-[#f8fafc] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7033ff] text-[20px]">location_on</span>
                  Location / Address
                </h4>
                {!(selectedShop.provinceKh || selectedShop.districtKh || selectedShop.communeKh || selectedShop.village || selectedShop.addressDetail || selectedShop.fullAddressKh) ? (
                  <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] italic bg-[#f8fafc] dark:bg-[#09090b] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] text-center">
                    No address added
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-[#f8fafc] dark:bg-[#09090b] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a]">
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">ខេត្ត / Province</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.provinceKh ? `${selectedShop.provinceKh} / ${selectedShop.provinceEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">ស្រុក-ក្រុង / District</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.districtKh ? `${selectedShop.districtKh} / ${selectedShop.districtEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">ឃុំ-សង្កាត់ / Commune</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.communeKh ? `${selectedShop.communeKh} / ${selectedShop.communeEn}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">ភូមិ / Village</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.village || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">អាសយដ្ឋានលម្អិត / Detailed Address</p>
                      <p className="text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{selectedShop.addressDetail || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider mb-1">អាសយដ្ឋានពេញលេញ / Full Address</p>
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
                Close
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
              <h3 className="text-xl font-bold text-center text-[#020617] dark:text-[#f8fafc] mb-2">Archive Shop</h3>
              <p className="text-[#64748b] dark:text-[#a1a1aa] text-center mb-6">
                This shop has business data. It will be archived, not permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setSelectedShop(null); }}
                  className={secondaryButtonClass}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmArchive}
                  className="flex-1 h-11 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Archiving..." : "Archive Shop"}
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
              <h3 className="text-xl font-bold text-center text-[#020617] dark:text-[#f8fafc] mb-2">Restore Shop</h3>
              <p className="text-[#64748b] dark:text-[#a1a1aa] text-center mb-6">
                This shop will become active again and can use the system based on POS access settings.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setSelectedShop(null); }}
                  className={secondaryButtonClass}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRestore}
                  className="flex-1 h-11 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Restoring..." : "Restore Shop"}
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
