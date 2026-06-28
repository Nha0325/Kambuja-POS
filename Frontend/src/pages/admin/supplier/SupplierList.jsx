import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { FaHandshake, FaCircleCheck } from "react-icons/fa6";

import {
  LuPlus,
  LuDownload,
  LuFilter,
  LuUsers,
  LuPencil,
  LuSearch,
  LuTrash2
} from "react-icons/lu";
import { useCollection } from "../../../hooks/common/useCollection";
import { useQuery } from "../../../hooks/common/useQuery";
import { adminSurface } from "../adminPageUi";
import { downloadCsv } from "../../../utils/helpers/downloadCsv";
import AdminPagination from "../../../components/admin/AdminPagination";

const supplierStats = [
  { label: "Total Suppliers", key: "total", icon: LuUsers },
  { label: "With Phone", key: "withPhone", icon: FaCircleCheck },
];

function Supplier() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refetch, setRefetch] = useState(false);
  const [showWithPhoneOnly, setShowWithPhoneOnly] = useState(false);

  const { data: suppliers, totalPage, isLoading } = useQuery("suppliers", search, page, limit, refetch);
  const { remove, isLoading: isDeleting } = useCollection("suppliers");
  const visibleSuppliers = showWithPhoneOnly
    ? suppliers?.filter((item) => item?.phone)
    : suppliers;
  const supplierCount = suppliers?.length || 0;
  const contactCount = suppliers?.filter((item) => item?.phone).length || 0;
  const lastPage = totalPage || 1;
  const statValues = {
    total: supplierCount,
    withPhone: contactCount,
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure! you want to delete?")) {
      const res = await remove(id);
      if (res) {
        setRefetch(!refetch);
        toast.success("Deleted successfully!");
      }
    }
  };

  const handleDownload = () => {
    downloadCsv(
      "suppliers.csv",
      [
        { label: "Business Name", value: (row) => row?.businessName || "" },
        { label: "Name", value: (row) => row?.name || "" },
        { label: "Phone", value: (row) => row?.phone || "" },
        { label: "Address", value: (row) => row?.address || "" },
        { label: "Note", value: (row) => row?.note || "" },
      ],
      visibleSuppliers || []
    );
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Procurement</p>
          <h1 className={adminSurface.title}>Suppliers</h1>
          <p className={adminSurface.description}>
            Manage and monitor your supply chain network and vendor relationships.
          </p>
        </div>
        <Link to="/admin/suppliers/create" className={adminSurface.primaryButton}>
          <LuPlus />
          Add Supplier
        </Link>
      </div>

      <div className={adminSurface.statGrid}>
        {supplierStats.map(({ label, key, icon: Icon }) => (
          <div key={key} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>
              <Icon />
            </div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{statValues[key]}</p>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:w-80`}>
                <LuSearch className="shrink-0 text-[#6B7280]" />
                <input
                  className="w-full bg-transparent text-sm outline-none text-[#F8FAFC] placeholder-[#6B7280]"
                  type="search"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search suppliers, contacts, or phone..."
                />
              </label>
              <div className="flex overflow-hidden rounded-lg border border-[#2A2E36] bg-[#111318]">
                <button
                  type="button"
                  aria-label="Show suppliers with phone"
                  title="Show suppliers with phone"
                  aria-pressed={showWithPhoneOnly}
                  onClick={() => setShowWithPhoneOnly((value) => !value)}
                  className={`inline-flex h-10 w-10 items-center justify-center border-r border-[#2A2E36] transition hover:bg-[#2A2E36] ${
                    showWithPhoneOnly ? "bg-[#3350BF]/20 text-[#22D3EE]" : "text-[#A9A6BB]"
                  }`}
                >
                  <LuFilter />
                </button>
                <button
                  type="button"
                  aria-label="Download suppliers"
                  title="Download suppliers"
                  onClick={handleDownload}
                  disabled={!visibleSuppliers?.length}
                  className="inline-flex h-10 w-10 items-center justify-center text-[#A9A6BB] transition hover:bg-[#2A2E36] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LuDownload />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={adminSurface.tableWrap}>
          <table className={`${adminSurface.table} min-w-[980px]`}>
            <thead className={adminSurface.tableHead}>
              <tr>
                <th className={`${adminSurface.th} w-16 text-center`}>N.o</th>
                <th className={adminSurface.th}>Business Name</th>
                <th className={adminSurface.th}>Name</th>
                <th className={adminSurface.th}>Phone</th>
                <th className={adminSurface.th}>Address</th>
                <th className={adminSurface.th}>Note</th>
                <th className={`${adminSurface.th} w-28 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8">
                    <div className="flex items-center justify-center gap-3 text-[#A9A6BB]">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2A2E36] border-t-[#22D3EE]" />
                      Loading suppliers...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && visibleSuppliers?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3350BF]/10 text-3xl text-[#22D3EE]">
                        <FaHandshake />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[#F8FAFC]">No suppliers found</h2>
                        <p className="mt-1 text-sm text-[#A9A6BB]">
                          You have not registered any suppliers yet.
                        </p>
                      </div>
                      <Link to="/admin/suppliers/create" className={adminSurface.secondaryButton}>
                        <LuPlus />
                        Add Your First Supplier
                      </Link>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                visibleSuppliers?.map((item, idx) => (
                  <tr
                    key={item?._id || idx}
                    className={adminSurface.row}
                  >
                    <td className={`${adminSurface.td} text-center font-medium text-[#6B7280]`}>
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className={`${adminSurface.td} min-w-44 font-semibold text-[#F8FAFC]`}>{item?.businessName || "-"}</td>
                    <td className={`${adminSurface.td} min-w-36 text-[#A9A6BB]`}>{item?.name || "-"}</td>
                    <td className={`${adminSurface.td} min-w-32 text-[#A9A6BB]`}>{item?.phone || "-"}</td>
                    <td className={`${adminSurface.td} min-w-56 text-[#A9A6BB]`}>{item?.address || "-"}</td>
                    <td className={`${adminSurface.td} min-w-48 text-[#A9A6BB]`}>{item?.note || "-"}</td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/suppliers/${item._id}/edit`}
                          title="Edit supplier"
                          className={adminSurface.iconButton}
                        >
                          <LuPencil />
                        </Link>
                        <button
                          type="button"
                          title="Delete supplier"
                          onClick={() => handleDelete(item._id)}
                          disabled={isDeleting}
                          className={adminSurface.dangerIconButton}
                        >
                          <LuTrash2 />
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
          totalPage={lastPage}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
          previousDisabled={page === 1}
          nextDisabled={page >= lastPage}
        />
      </div>
    </div>
  );
}

export default Supplier;
