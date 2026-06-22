import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCollection from "../../hooks/useCollection";
import { adminSurface } from "../admin/adminPageUi";

function CreateCustomer() {
  const [loading, setLoading] = useState(false);
  const { create } = useCollection("customers");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    const res = await create(payload);
    if (res) {
      toast.success("Customer added successfully!");
      navigate("/admin/customers");
    }
    setLoading(false);
  };

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Clientele</p>
          <h1 className={adminSurface.title}>Add Customer</h1>
          <p className={adminSurface.description}>
            Register a new customer for POS billing.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className={adminSurface.card}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Name *</label>
              <input
                required
                name="name"
                className={`${adminSurface.input} w-full`}
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Phone *</label>
              <input
                required
                name="phone"
                className={`${adminSurface.input} w-full`}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Email</label>
              <input
                type="email"
                name="email"
                className={`${adminSurface.input} w-full`}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Address</label>
              <textarea
                name="address"
                className={`${adminSurface.input} min-h-24 w-full py-2`}
                placeholder="Enter physical address"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[#d7dced] pt-5">
            <Link to="/admin/customers" className={adminSurface.secondaryButton}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={adminSurface.primaryButton}
            >
              {loading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCustomer;
