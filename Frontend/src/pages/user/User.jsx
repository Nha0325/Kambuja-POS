import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link } from "react-router-dom";
import { IoPencilSharp } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import useCollection from "../../hooks/useCollection";
import toast from "react-hot-toast";

function User() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data, totalPage, isLoading } = useFetchData("users", page, limit, search, refetch);
  const { remove, isLoading: isDeleting } = useCollection("users");

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
    <div className="p-4">
      <div className="flex items-center justify-between mt-2">
        <h1 className="text-xl font-semibold text-black">User Management</h1>
        <Link to="/user/create" className="btn btn-sm btn-neutral">
          + Add User
        </Link>
      </div>

      <div className="bg-white mt-4 p-4 rounded-md border border-gray-200">
        <div className="flex items-center justify-between">
          <fieldset className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              className="select select-bordered select-sm h-9 min-h-0"
            >
              <option value={10}>10</option>
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
              placeholder="Search users..."
              className="input input-bordered input-sm h-9 w-64"
            />
          </fieldset>
        </div>

        <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                <th className="p-4 text-center font-semibold w-12">N.o</th>
                <th className="p-4 text-left font-semibold">Username</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Role</th>
                <th className="p-4 text-center font-semibold w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.map((user, index) => (
                  <tr key={user?._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm text-gray-800">
                    <td className="p-4 text-center font-medium text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="p-4 font-medium">{user?.username || "-"}</td>
                    <td className="p-4 text-gray-600">{user?.email || "-"}</td>
                    <td className="p-4 capitalize text-gray-600">{user?.role || "-"}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <Link
                          to={`/user/edit/${user._id}`}
                          className="btn btn-square btn-xs btn-outline border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <IoPencilSharp className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
                          disabled={isDeleting}
                          className="btn btn-square btn-xs btn-outline border-gray-200 text-red-600 hover:bg-red-100 hover:text-red-700"
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
  );
}

export default User;