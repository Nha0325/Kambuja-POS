import { useState } from "react";
import useFetchData from "../../../hooks/common/useFetchData";
import { Link } from "react-router-dom";
import { IoPencilSharp } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import useCollection from "../../../hooks/common/useCollection";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";
import AdminPagination from "../../../components/admin/AdminPagination";
import { useConfirm } from "../../../hooks/ui/useConfirm";

function User() {
  const { confirm, closeConfirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("users", page, limit, search, refetch);
  const { remove, isLoading: isDeleting } = useCollection("users");
  const userCount = data?.length || 0;
  const activeCount = data?.filter((user) => user?.status !== "INACTIVE")?.length || 0;

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Cashier",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      confirmText: "Yes, delete",
      cancelText: "Cancel",
      variant: "danger"
    });

    if (isConfirmed) {
      try {
        const res = await remove(id);
        if (res) {
          setRefetch(!refetch);
          toast.success("User deleted successfully!");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete user.");
      }
      closeConfirm();
    }
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Staff</p>
          <h1 className={adminSurface.title}>Cashiers</h1>
          <p className={adminSurface.description}>
            Manage cashier accounts, user roles, and shop access for the POS team.
          </p>
        </div>
        <Link to="/admin/cashiers/create" className={adminSurface.primaryButton}>
          + Add Cashier
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Total Cashiers", userCount],
          ["Active Cashiers", activeCount],
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
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              aria-label="Page size"
              title="Page size"
              className={adminSurface.pageSizeSelect}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </fieldset>

          <fieldset className="w-full lg:max-w-sm">
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className={`${adminSurface.input} w-full`}
            />
          </fieldset>
        </div>
        </div>

        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[760px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-12 text-center`}>N.o</th>
                <th className={adminSurface.th}>Username</th>
                <th className={adminSurface.th}>Email</th>
                <th className={adminSurface.th}>Role</th>
                <th className={adminSurface.th}>Status</th>
                <th className={`${adminSurface.th} w-24 text-center`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-[#A9A6BB]">
                    Loading users...
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-[#A9A6BB]">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.map((user, index) => (
                  <tr key={user?._id} className={adminSurface.row}>
                    <td className={`${adminSurface.td} text-center font-medium text-slate-500 dark:text-[#A9A6BB]`}>
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className={`${adminSurface.td} font-semibold text-slate-900 dark:text-[#F8FAFC]`}>{user?.username || "-"}</td>
                    <td className={`${adminSurface.td} text-slate-700 dark:text-[#A9A6BB]`}>{user?.email || "-"}</td>
                    <td className={`${adminSurface.td} capitalize text-slate-700 dark:text-[#A9A6BB]`}>{user?.role || "-"}</td>
                    <td className={adminSurface.td}>
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-bold tracking-wider ${user?.status === 'INACTIVE' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                        {user?.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className={`${adminSurface.td} text-center`}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <Link
                          to={`/admin/cashiers/${user._id}/edit`}
                          className={adminSurface.iconButton}
                        >
                          <IoPencilSharp className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
                          disabled={isDeleting}
                          className={adminSurface.dangerIconButton}
                        >
                          <IoMdTrash className="w-3.5 h-3.5" />
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
  );
}

export default User;
