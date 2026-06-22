import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link } from "react-router-dom";
import formatDate from "../../utils/formatDate";
import { FaCreditCard } from "react-icons/fa6";
import PurchasePaymentModal from "./PurchasePaymentModal";
import { TbTruckDelivery } from "react-icons/tb";
import PurchaseStatusModal from "./PurchaseStatusModal";

function Purchase() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [openStatus, setOpenStatus] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("purchases", page, limit, search, refetch);

  return (
    <>
      <div className="p-4">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-semibold text-black">Purchase Lists</h1>
          <Link to="/admin/purchases/create" className="btn btn-sm btn-neutral">
            + New Purchase
          </Link>
        </div>

        <div className="bg-white mt-4 p-4 rounded-md border border-gray-200">
          {/* Filters Panel */}
          <div className="flex items-center justify-between">
            <fieldset className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                onChange={(e) => setLimit(Number(e.target.value))}
                value={limit}
                className="select select-bordered select-sm h-9 min-h-0"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </fieldset>

            <fieldset>
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchase..."
                className="input input-bordered input-sm h-9 w-64"
              />
            </fieldset>
          </div>

          {/* Main Purchase Table Grid */}
          <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                  <th className="p-4 text-center font-semibold w-12">N.o</th>
                  <th className="p-4 text-left font-semibold">Supplier</th>
                  <th className="p-4 text-left font-semibold">Purchase By</th>
                  <th className="p-4 text-right font-semibold">Total Cost</th>
                  <th className="p-4 text-right font-semibold">Due Amount</th>
                  <th className="p-4 text-right font-semibold">Change Amount</th>
                  <th className="p-4 text-center font-semibold">Payment Status</th>
                  <th className="p-4 text-center font-semibold">Purchase Status</th>
                  <th className="p-4 text-center font-semibold">Purchase Date</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center p-8 text-gray-500">
                      កំពុងទាញយកទិន្នន័យ...
                    </td>
                  </tr>
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center p-8 text-gray-400">
                      មិនមានទិន្នន័យទិញទំនិញឡើយ។
                    </td>
                  </tr>
                ) : (
                  data?.map((el, index) => (
                    <tr key={el?._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm text-gray-800">
                      {/* Row Auto-Increment Index Number */}
                      <td className="p-4 text-center font-medium text-gray-500">
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* Supplier */}
                      <td className="p-4 font-medium">
                        {el?.supplier?.businessName || el?.supplier?.name || "—"}
                      </td>

                      {/* Purchased By (User Account Name) */}
                      <td className="p-4 text-gray-600 font-medium">
                        {el?.user?.username || el?.user?.name || "Admin"}
                      </td>

                      {/* Total Cost */}
                      <td className="p-4 text-right font-semibold text-red-600 whitespace-nowrap">
                        {(el?.totalCost || 0).toLocaleString()} ៛
                      </td>

                      {/* Due Amount */}
                      <td className="p-4 text-right text-orange-600 font-medium whitespace-nowrap">
                        {(el?.dueAmount || 0).toLocaleString()} ៛
                      </td>

                      {/* Change Amount */}
                      <td className="p-4 text-right text-green-600 font-medium whitespace-nowrap">
                        {(el?.changeAmount || 0).toLocaleString()} ៛
                      </td>

                      {/* Payment Status Badges */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {el?.paymentStatus === "paid" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            Paid
                          </span>
                        )}
                        {el?.paymentStatus === "due" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Due
                          </span>
                        )}
                        {el?.paymentStatus === "partial" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Partial
                          </span>
                        )}
                      </td>

                      {/* Purchase Operational Status Badges */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {el?.purchaseStatus === "received" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                            Received
                          </span>
                        )}
                        {el?.purchaseStatus === "pending" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                            Pending
                          </span>
                        )}
                        {el?.purchaseStatus === "ordered" && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            Ordered
                          </span>
                        )}
                      </td>

                      {/* Purchase Date */}
                      <td className="p-4 text-center whitespace-nowrap text-gray-600">
                        {el?.purchaseDate ? formatDate(el.purchaseDate) : "N/A"}
                      </td>

                      {/* Action Modal Trigger Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            title="Update Payment"
                            onClick={() => {
                              setEditId(el?._id);
                              setOpen(true);
                            }}
                            className="btn btn-square btn-xs btn-outline border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                            className="btn btn-square btn-xs btn-outline border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Page {page}/{totalPage || 1}
            </p>
            <div className="join">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="join-item btn btn-sm btn-outline border-gray-200"
              >
                {"<<"}
              </button>
              <button className="join-item btn btn-sm btn-active bg-gray-100 border-gray-200 pointer-events-none">
                Page {page}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPage}
                className="join-item btn btn-sm btn-outline border-gray-200"
              >
                {">>"}
              </button>
            </div>
          </div>
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
