import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import { IoPencilSharp } from "react-icons/io5";
import useCollection from "../../../hooks/useCollection";
import useFetchData from "../../../hooks/useFetchData";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";

function Category() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading, total, totalWithNotes } = useFetchData("categories", page, limit, search, refetch);
  const { remove, isLoading: isDeleting } = useCollection("categories");
  const categoryCount = total || data?.length || 0;
  const notedCount = totalWithNotes !== undefined && totalWithNotes > 0 ? totalWithNotes : (data?.filter((item) => item?.note).length || 0);

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
          <p className={adminSurface.eyebrow}>Catalog</p>
          <h1 className={adminSurface.title}>Categories</h1>
          <p className={adminSurface.description}>
            Organize products into clean groups for browsing, reporting, and stock control.
          </p>
        </div>
        <Link to="/admin/categories/create" className={adminSurface.primaryButton}>
          + Add Category
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Categories", categoryCount],
          ["With notes", notedCount],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

          <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:max-w-sm`}>
            <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input
              className="w-full text-sm"
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
          <table className={`${adminSurface.table} min-w-[700px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-16 text-center`}>N.o</th>
                <th className={adminSurface.th}>Name</th>
                <th className={adminSurface.th}>Note</th>
                <th className={`${adminSurface.th} w-28 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-8">
                    <div className="flex justify-center text-[#45464d]">
                      <span className="loading loading-spinner" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-[#5b6472]">
                    No categories found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.map((item, idx) => (
                  <tr
                    key={item?._id || idx}
                    className={adminSurface.row}
                  >
                    <td className={`${adminSurface.td} text-center font-medium text-[#5b6472]`}>
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className={`${adminSurface.td} min-w-44 font-semibold text-[#0b1c30]`}>{item.name || "-"}</td>
                    <td className={`${adminSurface.td} min-w-60 text-[#45464d]`}>{item.note || "-"}</td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/categories/${item._id}/edit`}
                          title="Edit category"
                          className={adminSurface.iconButton}
                        >
                          <IoPencilSharp />
                        </Link>
                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => handleDelete(item._id)}
                          className={adminSurface.dangerIconButton}
                        >
                          <IoMdTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
