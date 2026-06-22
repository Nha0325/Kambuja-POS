import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link } from "react-router";
import { IoEye } from "react-icons/io5";
import formatDate from "../../utils/formatDate";
import { FaCreditCard } from "react-icons/fa6";
import SalePaymentModal from "./SalePaymentModal";
import Loading from "../../components/Loading";
import useCurrent from "../../hooks/auth/useCurrent";
import { ROLES, normalizeRole } from "../../utils/role";

function ListSale() {
  const { data: currentUser } = useCurrent()
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("sales", page, limit, search, refetch);

  if (isLoading && (!data || data.length === 0) && page === 1) return <Loading />;

  return (
    <>
      <div className="w-full max-w-full p-3 sm:p-4">
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-black">Sale Lists</h1>
          {normalizeRole(currentUser?.role) === ROLES.CASHIER && (
            <Link to="/cashier/pos" className="btn btn-sm btn-neutral w-full sm:w-auto">
              + New Sale
            </Link>
          )}
        </div>

        <div className="bg-white mt-4 p-4 rounded-md border border-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              className="select select-sm select-bordered"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>

            <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:w-64">
              <input
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="grow text-xs"
                placeholder="Search Invoice..."
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table min-w-[1120px] w-full border-collapse">
            <thead className="text-xs text-slate-500 bg-gray-50">
              <tr>
                <th className="py-3 px-2">N.o</th>
                <th className="py-3 px-2">Invoice</th>
                <th className="py-3 px-2">Sale By</th>
                <th className="py-3 px-2">Total Cost</th>
                <th className="py-3 px-2">Paid Amount</th>
                <th className="py-3 px-2">Due Amount</th>
                <th className="py-3 px-2">Change Amount</th>
                <th className="py-3 px-2">Payment Status</th>
                <th className="py-3 px-2">Created Date</th>
                <th className="py-3 px-2 text-center">Action</th>
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
                    <td colSpan="10" className="text-center p-8 text-gray-400 font-medium">
                      មិនមានទិន្នន័យលក់ឡើយ។
                    </td>
                  </tr>
                ) : (
                  data?.map((item, idx) => {
                    const totalCost = Number(item?.totalCost || 0);
                    const paidAmount = Number(item?.paidAmount || 0);
                    const dueAmount = Number(item?.dueAmount || 0);
                    const changeAmount = Number(item?.changeAmount || 0);

                    return (
                      <tr key={item?._id || idx} className="border-b border-gray-100 text-xs hover:bg-gray-50">
                        <td className="px-2 py-3">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-2 font-semibold text-gray-800 uppercase">{item?.invoiceNumber || "-"}</td>
                        <td className="px-2 capitalize text-gray-700">{item?.user?.username || "-"}</td>
                        <td className="px-2 text-gray-800 font-medium">{totalCost.toLocaleString()}៛</td>
                        <td className="px-2 text-green-600 font-medium">{paidAmount.toLocaleString()}៛</td>
                        <td className={`px-2 font-semibold ${dueAmount > 0 ? "text-error" : "text-gray-500"}`}>
                          {dueAmount.toLocaleString()}៛
                        </td>
                        <td className="px-2 text-blue-600 font-medium">{changeAmount.toLocaleString()}៛</td>
                        <td className="px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${
                              item?.paymentStatus === "due" ? "bg-red-100 text-red-800" :
                              item?.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.paymentStatus || "-"}
                          </span>
                        </td>
                        <td className="px-2 text-gray-500">{formatDate(item.createdAt)}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => {
                                setOpen(true); 
                                setEditId(item._id);
                              }} 
                              type="button" 
                              disabled={item.paymentStatus === 'paid'} 
                              className={`text-lg transition ${item.paymentStatus === "paid" ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                            >
                              <FaCreditCard />
                            </button>
                            <Link
                              to={`/sale/invoice/${item._id}`}
                              target="_blank"
                              className="text-lg text-gray-700 hover:text-black transition"
                            >
                              <IoEye />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
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
              <button className="join-item btn btn-sm btn-active bg-gray-100 border-gray-200 pointer-events-none">{page}</button>
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

      {open && (
        <SalePaymentModal 
          open={open} 
          editId={editId} 
          onClose={() => {
            setOpen(false);
            setRefetch(!refetch);
          }}
        />
      )}
    </>
  );
}

export default ListSale;
