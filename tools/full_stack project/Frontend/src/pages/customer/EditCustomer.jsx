import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import useCollection from "../../hooks/useCollection";
import useFetchOne from "../../hooks/useFetchOne";

function EditCustomer() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const route = useParams();
  const navigate = useNavigate();

  const { update, isLoading } = useCollection("customers");
  const { data } = useFetchOne("customers", route.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await update(route.id, {
      name,
      phone,
      address,
      note,
    });
    if (res) {
      clearForm();
      navigate('/customer');
    }
  };

  function clearForm() {
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
  }

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setNote(data.note || "");
    }
  }, [data]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-black">Edit Customer</h1>
      </div>

      {/* លុប bg-slate ចេញ និងថែម border Border-gray-200 */}
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

export default EditCustomer;