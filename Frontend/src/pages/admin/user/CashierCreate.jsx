import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useSignup from "../../../hooks/auth/useSignup";

function CreateUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <section className="min-h-screen bg-[#f8f9ff] px-3 py-4 text-[#0b1c30] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#45464d]">
          <Link
            to="/admin/cashiers"
            className="flex items-center font-medium transition-colors hover:text-[#0058be]"
          >
            Cashiers
          </Link>

          <span className="text-[#76777d]">›</span>

          <span className="font-semibold text-[#0b1c30]">
            Create New Cashier
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main Form Card */}
          <div className="w-full flex-1 overflow-hidden rounded-xl border border-[#c6c6cd] bg-white">
            {/* Card Header */}
            <div className="border-b border-[#c6c6cd] bg-[#eff4ff]/70 p-6">
              <h1 className="text-xl font-semibold text-[#0b1c30]">
                Add Cashier
              </h1>
              <p className="mt-1 text-sm text-[#45464d]">
                Create a new user account with cashier permissions for point-of-sale access.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-8 p-6">
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-[#0b1c30]"
                  >
                    Username <span className="text-[#ba1a1a]">*</span>
                  </label>

                  <input
                    id="username"
                    name="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-[#c6c6cd] bg-white p-4 text-sm text-[#0b1c30] outline-none transition-all placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                    placeholder="e.g. john_doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-[#0b1c30]"
                  >
                    Email <span className="text-[#ba1a1a]">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-lg border border-[#c6c6cd] bg-white p-4 text-sm text-[#0b1c30] outline-none transition-all placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                    placeholder="e.g. john@kambuja.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#0b1c30]"
                  >
                    Password <span className="text-[#ba1a1a]">*</span>
                  </label>

                  <input
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full rounded-lg border border-[#c6c6cd] bg-white p-4 text-sm text-[#0b1c30] outline-none transition-all placeholder:text-[#76777d] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10"
                    placeholder="Enter secure password"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#c6c6cd] bg-[#eff4ff]/50 p-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/cashiers"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#c6c6cd] bg-white px-8 text-sm font-semibold text-[#0b1c30] transition-colors hover:bg-[#e5eeff] active:scale-[0.98] sm:w-auto"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0b1c30] px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0b1c30]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
