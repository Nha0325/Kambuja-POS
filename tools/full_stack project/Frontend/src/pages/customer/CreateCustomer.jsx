import { useState } from "react";
import { Link, useNavigate } from "react-router"; // បន្ថែម useNavigate សម្រាប់ redirect ទៅទំព័រដើមវិញ
import useCollection from "../../hooks/useCollection";

function CreateCustomer() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const { create, isLoading } = useCollection("customers");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await create({
      name,
      phone,
      address,
      note,
    });
    if (res) {
      clearForm();
      navigate('/customer'); // ពេល Save ជោគជ័យ ឲ្យត្រឡប់ទៅទំព័របញ្ជីឈ្មោះវិញ
    }
  };

  function clearForm() {
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
  }

  return (
    <div className="p-4">
      {/* កែពី Create New Supplier ទៅជា Create New Customer */}
      <h1 className="text-xl font-semibold text-black">Create New Customer</h1>

      {/* លុប bg-slate ចេញ ដើម្បីឲ្យវា white ស្អាត និងមាន border ដូចទំព័រ list */}
      <div className="max-w-lg bg-white p-4 rounded-lg mt-4 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="customer-name" className="block text-sm font-medium mb-1">
              Name*
            </label>
            <input
              id="customer-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter customer name"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="customer-phone" className="block text-sm font-medium mb-1">
              Phone*
            </label>
            <input
              id="customer-phone"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="text"
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter customer phone"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="customer-address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <textarea
              id="customer-address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded"
              placeholder="Type your address here..."
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="customer-note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="customer-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded"
              placeholder="Type customer note here..."
            ></textarea>
          </div>

          <div className="flex justify-end items-center space-x-2 mt-4">
            <Link to={`/customer`} className="btn btn-sm">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCustomer;