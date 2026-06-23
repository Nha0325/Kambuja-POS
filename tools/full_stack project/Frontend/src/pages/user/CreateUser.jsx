import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import useSignup from "../../hooks/auth/useSignup";

function CreateUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");

  const navigate = useNavigate();
  const { isLoading, signup } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup({
        username,
        email,
        password,
        role,
      });
      if (res) {
        toast.success("User created successfully!");
        navigate("/user");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create user.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Create New User</h1>
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
            <label className="block">Password*</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input input-bordered w-full"
              placeholder="Enter password"
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

export default CreateUser;
