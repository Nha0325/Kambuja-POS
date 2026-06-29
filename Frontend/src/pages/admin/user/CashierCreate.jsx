import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useSignup from "../../../hooks/auth/useSignup";

function CreateUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const role = "CASHIER"

  const navigate = useNavigate();
  const { isLoading, signup } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        status,
      });
      if (res) {
        toast.success("Cashier created successfully!");
        navigate("/admin/cashiers");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create cashier.");
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link
            to="/admin/cashiers"
            className="flex items-center font-medium transition-colors hover:text-[#06b6d4]"
          >
            Cashiers
          </Link>

          <span className="text-[#64748b] dark:text-[#a1a1aa]">›</span>

          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">
            Create New Cashier
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main Form Card */}
          <div className="w-full flex-1 overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
            {/* Card Header */}
            <div className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6">
              <h1 className="text-xl font-semibold text-[#020617] dark:text-[#f8fafc]">
                Add Cashier
              </h1>
              <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">
                Create a new user account with cashier permissions for point-of-sale access.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8 p-6">
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="username"
                    name="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                    placeholder="e.g. john_doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                    placeholder="e.g. john@kambuja.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                    placeholder="Enter secure password"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-[#020617] dark:text-[#f8fafc]"
                  >
                    Account Status <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
                  >
                    <option value="ACTIVE">Active (Can login)</option>
                    <option value="INACTIVE">Inactive (Locked)</option>
                  </select>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/cashiers"
                  className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex h-10 items-center justify-center w-full sm:w-auto"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex h-10 items-center justify-center w-full sm:w-auto"
                >
                  {isLoading ? "Saving..." : "Save Cashier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreateUser;
