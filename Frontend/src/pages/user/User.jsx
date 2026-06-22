import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link } from "react-router-dom";
import { IoPencilSharp } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import useCollection from "../../hooks/useCollection";
import toast from "react-hot-toast";
import { adminSurface } from "../admin/adminPageUi";

function User() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("users", page, limit, search, refetch);
  const { remove, isLoading: isDeleting } = useCollection("users");
  const userCount = data?.length || 0;
  const cashierCount = data?.filter((user) => user?.role === "cashier")?.length || 0;

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await remove(id);
        if (res) {
          setRefetch(!refetch);
          toast.success("User deleted successfully!");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete user.");
      }
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
          ["Users", userCount],
          ["Cashiers", cashierCount],
          ["Page", page],
          ["Rows per page", limit],
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
          <fieldset className="flex items-center space-x-2">
            <span className="text-sm text-[#45464d]">Show</span>
            <select
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              className={`${adminSurface.select} w-20`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-[#45464d]">entries</span>
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
                <th className={`${adminSurface.th} w-24 text-center`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[#45464d]">
                    Loading users...
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[#5b6472]">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.map((user, index) => (
                  <tr key={user?._id} className={adminSurface.row}>
                    <td className={`${adminSurface.td} text-center font-medium text-[#5b6472]`}>
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className={`${adminSurface.td} font-semibold text-[#0b1c30]`}>{user?.username || "-"}</td>
                    <td className={`${adminSurface.td} text-[#45464d]`}>{user?.email || "-"}</td>
                    <td className={`${adminSurface.td} capitalize text-[#45464d]`}>{user?.role || "-"}</td>
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

        <div className={adminSurface.footer}>
          <p className="text-sm text-[#45464d]">
            Page {page}/{totalPage || 1}
          </p>
          <div className="join">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="join-item btn btn-sm border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              {"<<"}
            </button>
            <button className="join-item btn btn-sm pointer-events-none border-[#0058be] bg-[#d8e2ff] text-[#0058be]">
              Page {page}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPage}
              className="join-item btn btn-sm border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
