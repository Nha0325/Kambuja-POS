import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link } from "react-router";
import { LuEye, LuCreditCard, LuSearch } from "react-icons/lu";
import formatDate from "../../utils/formatDate";
import SalePaymentModal from "./SalePaymentModal";
import Loading from "../../components/Loading";
import useCurrent from "../../hooks/auth/useCurrent";
import { ROLES, normalizeRole } from "../../utils/role";
import AdminPagination from "../../components/admin/AdminPagination";
import { adminSurface } from "../admin/adminPageUi";

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
      <div className={adminSurface.page}>
        <div className={adminSurface.header}>
          <div>
            <p className={adminSurface.eyebrow}>Sales</p>
            <h1 className={adminSurface.title}>Sale Lists</h1>
            <p className={adminSurface.description}>
              Review completed POS sales, payment statuses, and invoice details.
            </p>
          </div>
          {normalizeRole(currentUser?.role) === ROLES.CASHIER && (
            <Link to="/cashier/pos" className={adminSurface.primaryButton}>
              + New Sale
            </Link>
          )}
        </div>

        <div className={adminSurface.tableShell}>
          <div className={adminSurface.toolbar}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <select
                onChange={(e) => setLimit(Number(e.target.value))}
                value={limit}
                aria-label="Page size"
                title="Page size"
                className={adminSurface.pageSizeSelect}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>

              <div className="relative w-full sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LuSearch className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  className={`${adminSurface.input} w-full pl-10`}
                  placeholder="Search Invoice..."
                />
              </div>
            </div>
          </div>

          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[1120px]`}>
              <thead className={adminSurface.tableHead}>
                <tr>
                  <th className={adminSurface.th}>N.o</th>
                  <th className={adminSurface.th}>Invoice</th>
                  <th className={adminSurface.th}>Sale By</th>
                  <th className={`${adminSurface.th} text-right`}>Total Cost</th>
                  <th className={`${adminSurface.th} text-right`}>Paid Amount</th>
                  <th className={`${adminSurface.th} text-right`}>Due Amount</th>
                  <th className={`${adminSurface.th} text-right`}>Change</th>
                  <th className={`${adminSurface.th} text-center`}>Status</th>
                  <th className={`${adminSurface.th} text-right`}>Date</th>
                  <th className={`${adminSurface.th} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-[#4E4E50]">
                      Loading sales data...
                    </td>
                  </tr>
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center font-medium text-[#4E4E50]">
                      No sales records found.
                    </td>
                  </tr>
                ) : (
                  data?.map((item, idx) => {
                    const totalCost = Number(item?.totalCost || 0);
                    const paidAmount = Number(item?.paidAmount || 0);
                    const dueAmount = Number(item?.dueAmount || 0);
                    const changeAmount = Number(item?.changeAmount || 0);

                    return (
                      <tr key={item?._id || idx} className={adminSurface.row}>
                        <td className={`${adminSurface.td} text-[#A9A6BB]`}>{(page - 1) * limit + idx + 1}</td>
                        <td className={`${adminSurface.td} font-bold uppercase`}>{item?.invoiceNumber || "-"}</td>
                        <td className={`${adminSurface.td} capitalize`}>{item?.user?.username || "-"}</td>
                        <td className={`${adminSurface.td} text-right font-medium`}>${totalCost.toFixed(2)}</td>
                        <td className={`${adminSurface.td} text-right font-medium text-[#22C55E]`}>${paidAmount.toFixed(2)}</td>
                        <td className={`${adminSurface.td} text-right font-semibold ${dueAmount > 0 ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
                          ${dueAmount.toFixed(2)}
                        </td>
                        <td className={`${adminSurface.td} text-right font-medium text-[#22D3EE]`}>${changeAmount.toFixed(2)}</td>
                        <td className={`${adminSurface.td} text-center`}>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase border ${
                              item?.paymentStatus === "due" ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" :
                              item?.paymentStatus === "partial" ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" :
                              "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                            }`}
                          >
                            {item.paymentStatus || "-"}
                          </span>
                        </td>
                        <td className={`${adminSurface.td} text-right text-[#A9A6BB]`}>{formatDate(item.createdAt)}</td>
                        <td className={adminSurface.td}>
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setOpen(true); 
                                setEditId(item._id);
                              }} 
                              type="button" 
                              disabled={item.paymentStatus === 'paid'} 
                              className={adminSurface.iconButton}
                              title="Process Payment"
                            >
                              <LuCreditCard />
                            </button>
                            <Link
                              to={`/sale/invoice/${item._id}`}
                              target="_blank"
                              className={adminSurface.iconButton}
                              title="View Invoice"
                            >
                              <LuEye />
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
