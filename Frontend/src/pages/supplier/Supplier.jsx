import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import { IoPencilSharp } from "react-icons/io5";
import { useCollection } from "../../hooks/useCollection";
import { useQuery } from "../../hooks/useQuery";

function Supplier() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);

  const { data: suppliers, totalPage, isLoading } = useQuery("suppliers", search, page, limit, refetch);
  const { remove, isLoading: isDeleting } = useCollection("suppliers");

  const handleDelete = async (id) => {
    if (confirm("Are you sure! you want to delete?")) {
      const res = await remove(id);
      if (res && isDeleting === false) {
        setRefetch(!refetch);
        toast.success("Deleted successfully!");
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Supplier</h1>
        <Link to="/admin/suppliers/create" className="btn btn-sm btn-neutral">
          + Add Supplier
        </Link>
      </div>

      <div className="bg-white mt-4 rounded-md border border-gray-200 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <fieldset className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              value={limit}
              className="select select-bordered select-sm h-9 min-h-0 w-20 rounded-md text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </fieldset>

          <label className="input input-bordered input-sm flex h-9 min-h-0 w-full items-center gap-2 rounded-md text-sm sm:max-w-xs">
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
              placeholder="Search suppliers..."
            />
          </label>
        </div>

        <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-700 border-b border-gray-200">
                <th className="w-16 p-4 text-center font-semibold">N.o</th>
                <th className="p-4 text-left font-semibold">Business Name</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Address</th>
                <th className="p-4 text-left font-semibold">Note</th>
                <th className="w-28 p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8">
                    <div className="flex justify-center text-gray-500">
                      <span className="loading loading-spinner" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && suppliers?.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-400">
                    No suppliers found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                suppliers?.map((item, idx) => (
                  <tr
                    key={item?._id || idx}
                    className="border-b border-gray-100 text-sm text-gray-800 transition-colors hover:bg-gray-50"
                  >
                    <td className="p-4 text-center font-medium text-gray-500">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="min-w-44 p-4 font-medium text-gray-900">{item?.businessName || "-"}</td>
                    <td className="min-w-36 p-4 text-gray-600">{item?.name || "-"}</td>
                    <td className="min-w-32 p-4 text-gray-600">{item?.phone || "-"}</td>
                    <td className="min-w-56 p-4 text-gray-600">{item?.address || "-"}</td>
                    <td className="min-w-48 p-4 text-gray-600">{item?.note || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/suppliers/${item._id}/edit`}
                          title="Edit supplier"
                          className="btn btn-square btn-xs btn-outline border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <IoPencilSharp />
                        </Link>
                        <button
                          type="button"
                          title="Delete supplier"
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-square btn-xs btn-outline border-red-100 text-red-600 hover:bg-red-50"
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

export default Supplier;
