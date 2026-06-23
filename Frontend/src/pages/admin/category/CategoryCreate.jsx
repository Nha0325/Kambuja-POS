import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCollection from "../../../hooks/useCollection";
import toast from "react-hot-toast";

function CreateCategory() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const { create, isLoading } = useCollection("categories");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await create({
      name: name.trim(),
      note: note.trim(),
    });

    if (res) {
      toast.success("Created successfully!!");
      clearForm();
      navigate("/admin/categories");
    }
  };

  function clearForm() {
    setName("");
    setNote("");
  }

  return (
    <section className="min-h-screen bg-[#f8f9ff] px-3 py-4 text-[#0b1c30] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#45464d]">
          <Link
            to="/admin/categories"
            className="flex items-center font-medium transition-colors hover:text-[#0058be]"
          >
            Categories
          </Link>

          <span className="text-[#76777d]">›</span>

          <span className="font-semibold text-[#0b1c30]">
            Create New Category
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main Form Card */}
          <div className="w-full flex-1 overflow-hidden rounded-xl border border-[#c6c6cd] bg-white">
            {/* Card Header */}
            <div className="border-b border-[#c6c6cd] bg-[#eff4ff]/70 p-6">
              <h1 className="text-xl font-semibold text-[#0b1c30]">
                Add Category
              </h1>
              <p className="mt-1 text-sm text-[#45464d]">
                Define a new product grouping for your inventory management.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8 p-6">
                {/* Category Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="category-name"
                    className="block text-sm font-semibold text-[#0b1c30]"
                  >
                    Category Name <span className="text-[#ba1a1a]">*</span>
                  </label>

                  <input
                    id="category-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-[#c6c6cd] bg-white p-4 text-sm text-[#0b1c30] outline-none transition-all placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                    placeholder="e.g. Beverages, Electronics, Summer Collection"
                  />

                  <p className="text-sm text-[#45464d]">
                    Keep names short and descriptive for easy identification.
                  </p>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label
                    htmlFor="category-note"
                    className="block text-sm font-semibold text-[#0b1c30]"
                  >
                    Note
                  </label>

                  <textarea
                    id="category-note"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[#c6c6cd] bg-white p-4 text-sm text-[#0b1c30] outline-none transition-all placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                    placeholder="Additional details about this category..."
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#c6c6cd] bg-[#eff4ff]/50 p-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/categories"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#c6c6cd] bg-white px-8 text-sm font-semibold text-[#0b1c30] transition-colors hover:bg-[#e5eeff] active:scale-[0.98] sm:w-auto"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0b1c30] px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0b1c30]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isLoading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Tips */}
          {/* <aside className="w-full rounded-xl border border-[#c6c6cd] bg-white p-6 lg:w-[320px]">
            <h2 className="text-base font-semibold text-[#0b1c30]">
              Quick Tips
            </h2>

            <div className="mt-4 space-y-3 text-sm text-[#45464d]">
              <div className="rounded-lg bg-[#eff4ff] p-3">
                Use short and clear category names.
              </div>

              <div className="rounded-lg bg-[#eff4ff] p-3">
                Avoid duplicate category names.
              </div>

              <div className="rounded-lg bg-[#eff4ff] p-3">
                Add notes only when extra detail is needed.
              </div>

              <div className="rounded-lg bg-[#eff4ff] p-3">
                Categories help organize products and reports.
              </div>
            </div>
          </aside> */}
        </div>
      </div>
    </section>
  );
}

export default CreateCategory;