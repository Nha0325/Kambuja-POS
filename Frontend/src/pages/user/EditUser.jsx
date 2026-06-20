import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import useFetchOne from "../../hooks/useFetchOne";
import toast from "react-hot-toast";

function EditUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");

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
        navigate("/user");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user.");
    }
  };

  useEffect(() => {
    if (data) {
      setUsername(data.username || "");
      setEmail(data.email || "");
      setRole(data.role || "cashier");
    }
  }, [data]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Edit User</h1>
      </div>

      <div className="max-w-lg bg-white p-6 rounded-lg mt-4 border border-gray-200 shadow-sm">
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

          <div className="mb-3">
            <label className="block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
              <option value="super">Super</option>
            </select>
          </div>

          <div className="flex justify-end items-center space-x-2">
            <Link to="/user" className="btn btn-sm">
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

export default EditUser;
