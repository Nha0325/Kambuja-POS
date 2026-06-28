import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useCollection from "../../../hooks/common/useCollection";
import useFetchOne from "../../../hooks/common/useFetchOne";
import toast from "react-hot-toast";

function EditUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const role = "CASHIER";

  const route = useParams();
  const navigate = useNavigate();

  const { data } = useFetchOne("users", route.id);
  const { update, isLoading } = useCollection("users");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await update(route.id, {
        username,
        email,
        role,
      });
      if (res) {
        toast.success("User updated successfully!");
        navigate("/admin/cashiers");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user.");
    }
  };

  useEffect(() => {
    if (data) {
      setUsername(data.username || "");
      setEmail(data.email || "");
    }
  }, [data]);

  return (
    <div className="w-full max-w-full p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit User</h1>
      </div>

      <div className="mt-4 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block">Username*</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-3">
            <label className="block">Email*</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="input input-bordered w-full"
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link to="/admin/cashiers" className="btn btn-sm w-full sm:w-auto">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral w-full sm:w-auto">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUser;
