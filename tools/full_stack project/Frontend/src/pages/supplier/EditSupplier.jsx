import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCollection } from "../../hooks/useCollection";
import toast from "react-hot-toast";
import { useFindById } from "../../hooks/useFindById";

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
      navigate("/supplier");
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-black">Edit Supplier</h1>
      </div>

      <div className="max-w-lg bg-white p-4 rounded-lg mt-4 border border-gray-200">
        <form onSubmit={handleSubmit}>
   
<div className="mb-3">
  <label htmlFor="supplier-businessName" className="block text-sm font-medium mb-1">
    Business name*
  </label>
  <input
    id="supplier-businessName"
    name="businessName"
    type="text"
    required
    value={businessName} 
    onChange={(e) => setBusinessName(e.target.value)}
    className="input input-sm input-bordered w-full rounded"
    placeholder="Enter business name"
  />
</div>

          <div className="mb-3">
            <label htmlFor="supplier-name" className="block text-sm font-medium mb-1">
              Name*
            </label>
            <input
              id="supplier-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="supplier-phone" className="block text-sm font-medium mb-1">
              Phone*
            </label>
            <input
              id="supplier-phone"
              name="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter phone"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="supplier-address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <textarea
              id="supplier-address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded"
              placeholder="Enter address"
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="supplier-note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="supplier-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded"
              placeholder="Enter note"
            ></textarea>
          </div>

          <div className="flex justify-end items-center space-x-2 mt-4">
            <Link to="/supplier" className="btn btn-sm">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral">
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSupplier;