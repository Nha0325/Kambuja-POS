import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuTrash2, LuPencil, LuSearch, LuPlus, LuPackage } from "react-icons/lu";
import useCollection from "../../../hooks/common/useCollection";
import useFetchData from "../../../hooks/common/useFetchData";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";
import formatDate from "../../../utils/formatters/formatDate";

function Category() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [refetch, setRefetch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const condition = statusFilter !== "All" ? `status=${statusFilter}` : "";
  const { data, totalPage, isLoading } = useFetchData("categories", page, limit, search, refetch, condition);
  const { data: allCategories } = useFetchData("categories", 1, 9999, "", refetch);
  const { data: allProducts } = useFetchData("products", 1, 9999, "", refetch);
  const { remove, isLoading: isDeleting } = useCollection("categories");

  const totalCategories = allCategories?.length || 0;
  const activeCategories = allCategories?.filter(c => c.status === "ACTIVE" || c.isActive === true || !c.status).length || 0;
  const productsLinked = allProducts?.filter(p => p.category || p.categoryId).length || 0;

  const handleDelete = async (id) => {
    if (confirm("Are you sure? you want to delete!")) {
      const res = await remove(id);
      if (res && isDeleting === false) {
        setRefetch(!refetch);
        toast.success("Deleted successfully!");
      }
    }
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Admin / Categories</p>
          <h1 className={adminSurface.title}>Categories</h1>
          <p className={adminSurface.description}>
            Organize products into clean groups for browsing, reporting, and stock control.
          </p>
        </div>
        <Link to="/admin/categories/create" className={adminSurface.primaryButton}>
          <LuPlus /> Add Category
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Total Categories", totalCategories],
          ["Active Categories", activeCategories],
          ["Products Linked", productsLinked],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <fieldset>
                <select
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  value={limit}
                  aria-label="Page size"
                  title="Page size"
                  className={adminSurface.pageSizeSelect}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="9999">All</option>
                </select>
              </fieldset>
              
              <fieldset>
                <select
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  value={statusFilter}
                  aria-label="Filter status"
                  title="Filter status"
                  className={adminSurface.pageSizeSelect}
                >
                  <option value="All">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </fieldset>
            </div>

            <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:max-w-sm`}>
              <LuSearch className="h-4 w-4 opacity-50 text-[#F8FAFC]" />
              <input
                className="w-full text-sm bg-transparent outline-none placeholder-[#6B7280] text-[#F8FAFC]"
                type="search"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search categories..."
              />
            </label>
          </div>
        </div>

        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[800px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-16 text-center`}>N.o</th>
                <th className={adminSurface.th}>Category</th>
                <th className={`${adminSurface.th} w-32`}>Products</th>
                <th className={`${adminSurface.th} w-32`}>Status</th>
                <th className={`${adminSurface.th} w-40`}>Updated</th>
                <th className={`${adminSurface.th} w-28 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="flex justify-center text-[#A9A6BB]">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2A2E36] border-t-[#22D3EE]" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#6B7280]">
                      <LuPackage className="h-12 w-12 text-[#3F3F46] mb-3" />
                      <p className="text-base font-medium text-[#F8FAFC]">No categories found</p>
                      <p className="text-sm mt-1">Add your first category to get started.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.map((item, idx) => {
                  const productsCount = allProducts?.filter(p => 
                    p.categoryId === item._id ||
                    p.category?._id === item._id ||
                    p.category === item.name ||
                    p.category === item._id
                  ).length || 0;

                  return (
                  <tr
                    key={item?._id || idx}
                    className={adminSurface.row}
                  >
                    <td className={`${adminSurface.td} text-center font-medium text-[#6B7280]`}>
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className={`${adminSurface.td}`}>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{item.name || "-"}</span>
                        {item.note && (
                          <span className="text-xs text-[#6B7280] mt-0.5 max-w-xs truncate" title={item.note}>{item.note}</span>
                        )}
                      </div>
                    </td>
                    <td className={`${adminSurface.td}`}>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#2A2E36] text-[#A9A6BB] text-xs font-bold">
                        {productsCount}
                      </span>
                    </td>
                    <td className={`${adminSurface.td}`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        item.status === 'ACTIVE' 
                          ? 'bg-[#10b981]/10 text-[#10b981]' 
                          : 'bg-[#ef4444]/10 text-[#ef4444]'
                      }`}>
                        {item.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className={`${adminSurface.td} text-sm text-[#A9A6BB]`}>
                      {item.updatedAt ? formatDate(item.updatedAt, "MMM DD, YYYY") : "-"}
                    </td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/categories/${item._id}/edit`}
                          title="Edit category"
                          className={adminSurface.iconButton}
                        >
                          <LuPencil />
                        </Link>
                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => handleDelete(item._id)}
                          className={adminSurface.dangerIconButton}
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
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
  );
}

export default Category;
