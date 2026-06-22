import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { FaHandshake } from "react-icons/fa6";
import { IoMdTrash } from "react-icons/io";
import {
  IoAdd,
  IoCheckmarkCircleOutline,
  IoChevronBack,
  IoChevronForward,
  IoDownloadOutline,
  IoFilterOutline,
  IoPeopleOutline,
  IoPencilSharp,
  IoReceiptOutline,
  IoSearch,
} from "react-icons/io5";
import { useCollection } from "../../hooks/useCollection";
import { useQuery } from "../../hooks/useQuery";
import { adminSurface } from "../admin/adminPageUi";
import { downloadCsv } from "../../utils/downloadCsv";

const supplierStats = [
  { label: "Total Suppliers", key: "total", icon: IoPeopleOutline },
  { label: "With Phone", key: "withPhone", icon: IoCheckmarkCircleOutline },
  { label: "Current Page", key: "page", icon: IoReceiptOutline },
  { label: "Rows Per Page", key: "limit", icon: FaHandshake },
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
    page,
    limit,
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
          <IoAdd />
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
            <fieldset className="flex items-center gap-2">
              <span className="text-sm text-[#45464d]">Show</span>
              <select
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                value={limit}
                className={`${adminSurface.select} w-20`}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-[#45464d]">entries</span>
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className={`${adminSurface.input} flex w-full items-center gap-2 lg:w-80`}>
                <IoSearch className="shrink-0 text-[#76777d]" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  type="search"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search suppliers, contacts, or phone..."
                />
              </label>
              <div className="flex overflow-hidden rounded-lg border border-[#c6c6cd] bg-white">
                <button
                  type="button"
                  aria-label="Show suppliers with phone"
                  title="Show suppliers with phone"
                  aria-pressed={showWithPhoneOnly}
                  onClick={() => setShowWithPhoneOnly((value) => !value)}
                  className={`inline-flex h-10 w-10 items-center justify-center border-r border-[#c6c6cd] transition hover:bg-[#eff4ff] ${
                    showWithPhoneOnly ? "bg-[#d8e2ff] text-[#0058be]" : "text-[#45464d]"
                  }`}
                >
                  <IoFilterOutline />
                </button>
                <button
                  type="button"
                  aria-label="Download suppliers"
                  title="Download suppliers"
                  onClick={handleDownload}
                  disabled={!visibleSuppliers?.length}
                  className="inline-flex h-10 w-10 items-center justify-center text-[#45464d] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IoDownloadOutline />
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
                    <div className="flex items-center justify-center gap-3 text-[#45464d]">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d8e2ff] border-t-[#0058be]" />
                      Loading suppliers...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && visibleSuppliers?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eff4ff] text-3xl text-[#76777d]">
                        <FaHandshake />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[#0b1c30]">No suppliers found</h2>
                        <p className="mt-1 text-sm text-[#45464d]">
                          You have not registered any suppliers yet.
                        </p>
                      </div>
                      <Link to="/admin/suppliers/create" className={adminSurface.secondaryButton}>
                        <IoAdd />
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
                    <td className={`${adminSurface.td} text-center font-medium text-[#5b6472]`}>
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className={`${adminSurface.td} min-w-44 font-semibold text-[#0b1c30]`}>{item?.businessName || "-"}</td>
                    <td className={`${adminSurface.td} min-w-36 text-[#45464d]`}>{item?.name || "-"}</td>
                    <td className={`${adminSurface.td} min-w-32 text-[#45464d]`}>{item?.phone || "-"}</td>
                    <td className={`${adminSurface.td} min-w-56 text-[#45464d]`}>{item?.address || "-"}</td>
                    <td className={`${adminSurface.td} min-w-48 text-[#45464d]`}>{item?.note || "-"}</td>
                    <td className={adminSurface.td}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/suppliers/${item._id}/edit`}
                          title="Edit supplier"
                          className={adminSurface.iconButton}
                        >
                          <IoPencilSharp />
                        </Link>
                        <button
                          type="button"
                          title="Delete supplier"
                          onClick={() => handleDelete(item._id)}
                          disabled={isDeleting}
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

        <div className={adminSurface.footer}>
          <p className="text-sm text-[#45464d]">
            Page {page}/{lastPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:text-[#76777d] disabled:opacity-60"
            >
              <IoChevronBack />
              Prev
            </button>
            <span className="inline-flex h-10 items-center justify-center rounded-lg border border-[#0058be] bg-[#d8e2ff] px-4 text-sm font-bold text-[#0058be]">
              Page {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= lastPage}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:text-[#76777d] disabled:opacity-60"
            >
              Next
              <IoChevronForward />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Supplier;
