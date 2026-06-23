import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import { IoPencilSharp } from "react-icons/io5";
import useCollection from "../../../hooks/useCollection";
import useFetchData from "../../../hooks/useFetchData";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";

function Customer() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("customers", page, limit, search, refetch);
  const { remove, isLoading: isDeleting } = useCollection("customers");
  const customerCount = data?.length || 0;

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
          <p className={adminSurface.eyebrow}>Clientele</p>
          <h1 className={adminSurface.title}>Customers</h1>
          <p className={adminSurface.description}>
            Manage your customer database and purchase history.
          </p>
        </div>
        <Link to="/admin/customers/create" className={adminSurface.primaryButton}>
          + Add Customer
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Total Customers", customerCount],
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
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </fieldset>

          <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:max-w-sm`}>
            <input
              className="w-full text-sm"
              type="search"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customers..."
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
                <th className={adminSurface.th}>Phone</th>
                <th className={adminSurface.th}>Email</th>
                <th className={`${adminSurface.th} w-28 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="p-8">
                    <div className="flex justify-center text-[#45464d]">
                      <span className="loading loading-spinner" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[#5b6472]">
                    No customers found.
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
                    <td className={`${adminSurface.td} text-[#45464d]`}>{item.phone || "-"}</td>
                    <td className={`${adminSurface.td} text-[#45464d]`}>{item.email || "-"}</td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/customers/${item._id}/edit`}
                          title="Edit customer"
                          className={adminSurface.iconButton}
                        >
                          <IoPencilSharp />
                        </Link>
                        <button
                          type="button"
                          title="Delete customer"
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

export default Customer;
