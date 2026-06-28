import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useCollection from "../../../hooks/common/useCollection";
import useFetchOne from "../../../hooks/common/useFetchOne";

import toast from "react-hot-toast";
import dayjs from "dayjs";
import { LuArrowLeft, LuPackageSearch } from "react-icons/lu";

function EditCategory() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [nameError, setNameError] = useState("");

  const route = useParams();
  const navigate = useNavigate();

  const { data, isLoading: isFetching } = useFetchOne("categories", route.id);
  const { update, isLoading: isSaving } = useCollection("categories");


  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setNote(data.note || "");
      setStatus(data.status || "ACTIVE");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }
    setNameError("");

    const res = await update(route.id, {
      name: name.trim(),
      note: note.trim(),
      status
    });
    if (res) {
      toast.success("Category updated successfully");
      navigate('/admin/categories');
    }
  };

  if (isFetching) {
    return (
      <section className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-[#27272a] mb-6"></div>
          <div className="w-full overflow-hidden rounded-2xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113]">
            <div className="p-6">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-[#27272a] mb-2"></div>
              <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-[#27272a]"></div>
            </div>
            <div className="p-6 space-y-6">
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-[#27272a]"></div>
              <div className="h-24 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-[#27272a]"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data && !isFetching) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 sm:px-4 lg:px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Category not found</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">The category you're trying to edit does not exist or has been removed.</p>
          <Link
            to="/admin/categories"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7033ff] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#5f27e6]"
          >
            Back to Categories
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <span className="font-medium text-slate-500 dark:text-zinc-400">Admin</span>
          <span>›</span>
          <Link
            to="/admin/categories"
            className="flex items-center font-medium transition-colors hover:text-[#7033ff]"
          >
            Categories
          </Link>
          <span>›</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Edit Category
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main Form Card */}
          <div className="w-full flex-1 overflow-hidden rounded-2xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113]">
            {/* Card Header */}
            <div className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Edit Category
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Update category details used for product grouping, reporting, and stock control.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/admin/categories"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-white dark:hover:bg-white/5"
                  title="Back to Categories"
                >
                  <LuArrowLeft className="h-4 w-4 text-slate-500 dark:text-zinc-400" /> Back
                </Link>
                <Link
                  to="/admin/products"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-white dark:hover:bg-white/5"
                  title="View Products"
                >
                  <LuPackageSearch className="h-4 w-4 text-[#7033ff]" /> View Products
                </Link>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="category-name"
                      className="block text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="category-name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      type="text"
                      className={`h-10 w-full rounded-lg border ${nameError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:border-[#7033ff] focus:ring-[#7033ff]/20 dark:border-[#27272a]"} bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#09090b] dark:text-white dark:placeholder:text-zinc-500`}
                      placeholder="Enter category name"
                    />
                    {nameError && (
                      <p className="text-xs text-red-500">{nameError}</p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <label
                      htmlFor="category-note"
                      className="block text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      Note
                    </label>
                    <textarea
                      id="category-note"
                      name="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      className="min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-white dark:placeholder:text-zinc-500"
                      placeholder="Short description for this category"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Status
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-1 dark:border-[#27272a] dark:bg-[#09090b] w-fit">
                      <button
                        type="button"
                        onClick={() => setStatus("ACTIVE")}
                        className={`flex h-8 items-center justify-center rounded-md px-4 text-sm font-medium transition-all ${
                          status === "ACTIVE"
                            ? "bg-white text-emerald-600 shadow-sm dark:bg-[#111113] dark:text-emerald-400"
                            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("INACTIVE")}
                        className={`flex h-8 items-center justify-center rounded-md px-4 text-sm font-medium transition-all ${
                          status === "INACTIVE"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-[#111113] dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="lg:border-l border-[#e5e7eb] dark:border-[#27272a] lg:pl-8 space-y-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Category Info</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Created At</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {data.createdAt ? dayjs(data.createdAt).format("MMM DD, YYYY h:mm A") : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Last Updated</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {data.updatedAt ? dayjs(data.updatedAt).format("MMM DD, YYYY h:mm A") : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/categories"
                  className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-white dark:hover:bg-white/5"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-[#7033ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5f27e6] disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditCategory;
