import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  IoArrowBack,
  IoBusinessOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { useCollection } from "../../../hooks/useCollection";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-lg border border-[#c6c6cd] bg-white px-3 py-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15";
const iconInputClass = `${inputClass} pl-10`;
const labelClass = "block text-xs font-semibold uppercase tracking-[0.12em] text-[#45464d]";

function FieldIcon({ children }) {
  return <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]">{children}</span>;
}

function TextareaIcon({ children }) {
  return <span className="absolute left-3 top-4 text-[#76777d]">{children}</span>;
}

function CreateSupplier() {
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  
  const { create, isLoading } = useCollection("suppliers");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      businessName,
      name,
      phone,
      address,
      note
    };
    const res = await create(data);
    if (res) {
      toast.success("Insert successfully!!");
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

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#45464d]">
            <Link to="/admin/suppliers" className="font-medium text-[#0058be] hover:underline">
              Suppliers
            </Link>
            <span>/</span>
            <span>Create New</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[#0b1c30] sm:text-3xl">Add Supplier</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#45464d]">
            Create a supplier profile for purchasing and inventory replenishment.
          </p>
        </div>
        <Link
          to="/admin/suppliers"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c6c6cd] bg-white px-4 py-2 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff]"
        >
          <IoArrowBack />
          Back to Suppliers
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-xl border border-[#d7dced] bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[#d7dced] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-[#0b1c30]">Create New Supplier</h2>
              <span className="text-sm text-[#45464d]">* Required fields</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="supplier-businessName" className={labelClass}>
                    Business Name*
                  </label>
                  <div className="relative">
                    <FieldIcon>
                      <IoBusinessOutline />
                    </FieldIcon>
                    <input
                      id="supplier-businessName"
                      name="businessName"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={iconInputClass}
                      placeholder="Enter business name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="supplier-name" className={labelClass}>
                    Contact Name*
                  </label>
                  <div className="relative">
                    <FieldIcon>
                      <IoPersonOutline />
                    </FieldIcon>
                    <input
                      id="supplier-name"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      className={iconInputClass}
                      placeholder="Enter supplier name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="supplier-phone" className={labelClass}>
                    Phone Number*
                  </label>
                  <div className="relative">
                    <FieldIcon>
                      <IoCallOutline />
                    </FieldIcon>
                    <input
                      id="supplier-phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      required
                      className={iconInputClass}
                      placeholder="Enter phone"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="supplier-address" className={labelClass}>
                  Business Address
                </label>
                <div className="relative">
                  <TextareaIcon>
                    <IoLocationOutline />
                  </TextareaIcon>
                  <textarea
                    id="supplier-address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`${iconInputClass} min-h-28 resize-y`}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="supplier-note" className={labelClass}>
                  Internal Notes
                </label>
                <div className="relative">
                  <TextareaIcon>
                    <IoDocumentTextOutline />
                  </TextareaIcon>
                  <textarea
                    id="supplier-note"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`${iconInputClass} min-h-32 resize-y`}
                    placeholder="Additional details, credit terms, or delivery preferences"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#e5eeff] pt-5 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/suppliers"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#c6c6cd] bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#0b1c30] bg-[#0b1c30] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#213145] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <IoSaveOutline />
                      Save Supplier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSupplier;
