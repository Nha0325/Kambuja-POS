import { useState } from "react";
import useFetchData from "../../../hooks/common/useFetchData";
import { Link } from "react-router-dom";
import formatDate from "../../../utils/formatters/formatDate";
import { FaCreditCard } from "react-icons/fa6";
import PurchasePaymentModal from "./PurchasePaymentModal";
import { TbTruckDelivery } from "react-icons/tb";
import PurchaseStatusModal from "./PurchaseStatusModal";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";

function Purchase() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [openStatus, setOpenStatus] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("purchases", page, limit, search, refetch);
  const purchaseCount = data?.length || 0;
  const totalCost = data?.reduce((sum, item) => sum + Number(item?.totalCost || 0), 0) || 0;
  const dueCount = data?.filter((item) => item?.paymentStatus === "due").length || 0;
  const pendingCount = data?.filter((item) => item?.purchaseStatus === "pending").length || 0;

  return (
    <>
      <div className={adminSurface.page}>
        {/* Top Header Controls */}
        <div className={adminSurface.header}>
          <div>
            <p className={adminSurface.eyebrow}>Procurement</p>
            <h1 className={adminSurface.title}>Purchases</h1>
            <p className={adminSurface.description}>
              Track supplier purchases, payment state, receiving status, and purchase dates.
            </p>
          </div>
          <Link to="/admin/purchases/create" className={adminSurface.primaryButton}>
            + New Purchase
          </Link>
        </div>

        <div className={adminSurface.statGrid}>
          {[
            ["Purchases", purchaseCount],
            ["Total cost", `$${Number(totalCost || 0).toFixed(2)}`],
            ["Due", dueCount],
            ["Pending", pendingCount],
          ].map(([label, value]) => (
            <div key={label} className={adminSurface.statCard}>
              <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
              <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
              <p className={adminSurface.statValue}>{value}</p>
            </div>
          ))}
        </div>

        <div className={adminSurface.tableShell}>
          {/* Filters Panel */}
          <div className={adminSurface.toolbar}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <fieldset>
              <select
                onChange={(e) => setLimit(Number(e.target.value))}
                value={limit}
                aria-label="Page size"
                title="Page size"
                className={adminSurface.pageSizeSelect}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </fieldset>

            <fieldset className="w-full lg:max-w-sm">
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchase..."
                className={`${adminSurface.input} w-full`}
              />
            </fieldset>
          </div>
          </div>

          {/* Main Purchase Table Grid */}
          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[1120px]`}>
              <thead className={adminSurface.tableHead}>
                <tr>
                  <th className={`${adminSurface.th} w-12 text-center`}>N.o</th>
                  <th className={adminSurface.th}>Supplier</th>
                  <th className={adminSurface.th}>Purchase By</th>
                  <th className={`${adminSurface.th} text-right`}>Total Cost</th>
                  <th className={`${adminSurface.th} text-right`}>Due Amount</th>
                  <th className={`${adminSurface.th} text-right`}>Change Amount</th>
                  <th className={`${adminSurface.th} text-center`}>Payment Status</th>
                  <th className={`${adminSurface.th} text-center`}>Purchase Status</th>
                  <th className={`${adminSurface.th} text-center`}>Purchase Date</th>
                  <th className={`${adminSurface.th} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-[#A9A6BB]">
                      Loading data...
                    </td>
                  </tr>
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-[#6B7280]">
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  data?.map((el, index) => (
                    <tr key={el?._id} className={adminSurface.row}>
                      {/* Row Auto-Increment Index Number */}
                      <td className={`${adminSurface.td} text-center font-medium text-[#6B7280]`}>
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* Supplier */}
                      <td className={`${adminSurface.td} font-semibold text-[#F8FAFC]`}>
                        {el?.supplier?.businessName || el?.supplier?.name || "—"}
                      </td>

                      {/* Purchased By (User Account Name) */}
                      <td className={`${adminSurface.td} font-medium text-[#A9A6BB]`}>
                        {el?.user?.username || el?.user?.name || "Admin"}
                      </td>

                      {/* Total Cost */}
                      <td className={`${adminSurface.td} text-right font-semibold text-[#F8FAFC]`}>
                        ${Number(el?.totalCost || 0).toFixed(2)}
                      </td>

                      {/* Due Amount */}
                      <td className={`${adminSurface.td} text-right font-medium text-[#EF4444]`}>
                        ${Number(el?.dueAmount || 0).toFixed(2)}
                      </td>

                      {/* Change Amount */}
                      <td className={`${adminSurface.td} text-right font-medium text-[#06b6d4]`}>
                        ${Number(el?.changeAmount || 0).toFixed(2)}
                      </td>

                      {/* Payment Status Badges */}
                      <td className={`${adminSurface.td} text-center`}>
                        {el?.paymentStatus === "paid" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-full">
                            Paid
                          </span>
                        )}
                        {el?.paymentStatus === "due" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-full">
                            Due
                          </span>
                        )}
                        {el?.paymentStatus === "partial" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] rounded-full">
                            Partial
                          </span>
                        )}
                      </td>

                      {/* Purchase Operational Status Badges */}
                      <td className={`${adminSurface.td} text-center`}>
                        {el?.purchaseStatus === "received" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-full">
                            Received
                          </span>
                        )}
                        {el?.purchaseStatus === "pending" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] rounded-full">
                            Pending
                          </span>
                        )}
                        {el?.purchaseStatus === "ordered" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-[#06b6d4]/20 border border-[#06b6d4]/50 text-[#06b6d4] rounded-full">
                            Ordered
                          </span>
                        )}
                      </td>

                      {/* Purchase Date */}
                      <td className={`${adminSurface.td} text-center text-[#A9A6BB]`}>
                        {el?.purchaseDate ? formatDate(el.purchaseDate) : "N/A"}
                      </td>

                      {/* Action Modal Trigger Buttons */}
                      <td className={`${adminSurface.td} text-center`}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            title="Update Payment"
                            onClick={() => {
                              setEditId(el?._id);
                              setOpen(true);
                            }}
                            className={adminSurface.iconButton}
                          >
                            <FaCreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Update Status"
                            onClick={() => {
                              setEditId(el?._id);
                              setOpenStatus(true);
                            }}
                            className={adminSurface.iconButton}
                          >
                            <TbTruckDelivery className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPage={totalPage}
            onPrevious={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
            previousDisabled={page === 1}
            nextDisabled={page >= (totalPage || 1)}
          />
        </div>
      </div>

      {/* Payment Update Modal */}
      {open && (
        <PurchasePaymentModal
          open={open}
          editId={editId}
          onClose={() => {
            setOpen(false);
            setRefetch(!refetch);
          }}
        />
      )}

      {/* Shipment Status Update Modal */}
      {openStatus && (
        <PurchaseStatusModal
          open={openStatus}
          editId={editId}
          onClose={() => {
            setOpenStatus(false);
            setRefetch(!refetch);
          }}
        />
      )}
    </>
  );
}

export default Purchase;
