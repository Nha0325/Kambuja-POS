import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCollection } from "../../../hooks/common/useCollection";
import toast from "react-hot-toast";
import { useFindById } from "../../../hooks/common/useFindById";

function EditSupplier() {
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const route = useParams();
  const navigate = useNavigate();

  const { update, isLoading } = useCollection("suppliers");
  const { data: supplier, isLoading: isFinding } = useFindById("suppliers", route.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      businessName,
      name,
      phone,
      address,
      note,
    };
    const res = await update(route.id, data);
    if (res) {
      toast.success("Update successfully!!");
      clearForm();
      navigate("/admin/suppliers");
    }
  };

  function clearForm() {
    setBusinessName("");
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
  }

  useEffect(() => {
    if (supplier && isFinding === false) {
      setBusinessName(supplier?.businessName || "");
      setName(supplier?.name || "");
      setPhone(supplier?.phone || "");
      setAddress(supplier?.address || "");
      setNote(supplier?.note || "");
    }
  }, [supplier, isFinding]);

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500";
  const labelClass = "block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2";

  return (
    <div className="w-full max-w-full space-y-6 bg-[#f8fafc] dark:bg-[#09090b] min-h-screen text-[#020617] dark:text-[#f8fafc]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-4 pt-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
            <Link to="/admin/suppliers" className="font-medium text-[#7033ff] hover:underline">
              Suppliers
            </Link>
            <span>/</span>
            <span>Edit Supplier</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl">Edit Supplier</h1>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="supplier-businessName" className={labelClass}>
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="supplier-businessName"
                  name="businessName"
                  type="text"
                  required
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label htmlFor="supplier-name" className={labelClass}>
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="supplier-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter contact name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="supplier-phone" className={labelClass}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="supplier-phone"
                name="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="Enter phone"
                required
              />
            </div>

            <div>
              <label htmlFor="supplier-address" className={labelClass}>
                Address
              </label>
              <textarea
                id="supplier-address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${inputClass} min-h-[100px] py-2 resize-y`}
                placeholder="Enter address"
              ></textarea>
            </div>

            <div>
              <label htmlFor="supplier-note" className={labelClass}>
                Note
              </label>
              <textarea
                id="supplier-note"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${inputClass} min-h-[100px] py-2 resize-y`}
                placeholder="Enter note"
              ></textarea>
            </div>

            <div className="pt-5 border-t border-[#e5e7eb] dark:border-[#27272a] flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link to="/admin/suppliers" className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center h-10 w-full sm:w-auto">
                Cancel
              </Link>
              <button type="submit" disabled={isLoading} className="bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full sm:w-auto">
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditSupplier;
