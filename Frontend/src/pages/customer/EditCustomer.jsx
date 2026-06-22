import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useCollection from "../../hooks/useCollection";
import { adminSurface } from "../admin/adminPageUi";
import { api } from "../../configs/api";

function EditCustomer() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const { update } = useCollection("customers");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setInitialData(res.data.result);
      } catch {
        toast.error("Failed to load customer");
      }
    };
    fetchCustomer();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    const res = await update(id, payload);
    if (res) {
      toast.success("Customer updated successfully!");
      navigate("/admin/customers");
    }
    setLoading(false);
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Clientele</p>
          <h1 className={adminSurface.title}>Edit Customer</h1>
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
                defaultValue={initialData.name}
                className={`${adminSurface.input} w-full`}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Phone *</label>
              <input
                required
                name="phone"
                defaultValue={initialData.phone}
                className={`${adminSurface.input} w-full`}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={initialData.email}
                className={`${adminSurface.input} w-full`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Address</label>
              <textarea
                name="address"
                defaultValue={initialData.address}
                className={`${adminSurface.input} min-h-24 w-full py-2`}
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
              {loading ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomer;
