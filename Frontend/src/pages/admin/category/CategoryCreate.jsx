import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCollection from "../../../hooks/common/useCollection";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function CreateCategory() {
  const { t } = useTranslation();
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
      toast.success(t('created_successfully'));
      clearForm();
      navigate("/admin/categories");
    }
  };

  function clearForm() {
    setName("");
    setNote("");
  }

  return (
    <section className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link
            to="/admin/categories"
            className="flex items-center font-medium transition-colors hover:text-[#06b6d4]"
          >
            {t('categories')}
          </Link>

          <span className="text-[#64748b] dark:text-[#a1a1aa]">›</span>

          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">
            {t('create_new_category')}
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main Form Card */}
          <div className="w-full flex-1 overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
            {/* Card Header */}
            <div className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6">
              <h1 className="text-xl font-semibold text-[#020617] dark:text-[#f8fafc]">
                {t('add_category')}
              </h1>
              <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">
                {t('define_category_desc')}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8 p-6">
                {/* Category Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="category-name"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    {t('category_name')} <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="category-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                    placeholder={t('category_name_placeholder')}
                  />

                  <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">
                    {t('keep_names_short')}
                  </p>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label
                    htmlFor="category-note"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    {t('note')}
                  </label>

                  <textarea
                    id="category-note"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    className="min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                    placeholder={t('category_note_placeholder')}
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/categories"
                  className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center w-full sm:w-auto"
                >
                  {t('cancel')}
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center w-full sm:w-auto"
                >
                  {isLoading ? t('saving') : t('save_category')}
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