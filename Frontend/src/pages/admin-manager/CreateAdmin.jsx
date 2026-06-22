import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { FaCircleInfo, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
import {
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./adminManagerUi"
import { PageHeader } from "./adminManagerComponents"

function CreateAdmin() {
  const navigate = useNavigate()
  const [shops, setShops] = useState([])
  const [form, setForm] = useState({ username: "", email: "", password: "", shopId: "" })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    adminManagerService.shops()
      .then((response) => setShops((response.data.result || []).filter((shop) => shop.status === "ACTIVE")))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      setIsSaving(true)
      await adminManagerService.createAdmin(form)
      toast.success("Admin created")
      navigate("/admin-manager/admins")
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to create admin")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Create Admin"
        description="Register a new administrative account for the Kambuja ecosystem."
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <form onSubmit={submit} className={`${cardClass} space-y-8 p-6 md:p-8 lg:col-span-8`}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              ["username", "Username", "text", "e.g. sokha_admin"],
              ["email", "Email Address", "email", "admin@kambuja.com"],
              ["password", "Password", "password", "********"],
            ].map(([name, label, type, placeholder]) => (
              <label key={name} className="space-y-2">
                <span className={labelClass}>{label}</span>
                <input
                  required
                  type={type}
                  autoComplete={type === "password" ? "new-password" : undefined}
                  className={inputClass}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className={labelClass}>Assign Shop Optional</span>
              <select className={selectClass} value={form.shopId} onChange={(event) => setForm({ ...form, shopId: event.target.value })}>
                <option value="">Unassigned admin</option>
                {shops.map((shop) => <option key={shop._id} value={shop._id}>{shop.name}</option>)}
              </select>
              <span className="block text-xs leading-5 text-slate-500">Unassigned admins can be selected as a new shop owner.</span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-violet-100 pt-6 sm:flex-row sm:justify-end">
            <Link className={`${secondaryButtonClass} w-full sm:w-auto`} to="/admin-manager/admins">Cancel</Link>
            <button className={`${primaryButtonClass} w-full sm:w-auto`} type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Admin Account"}
            </button>
          </div>
        </form>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
              <FaCircleInfo />
              Role Permissions
            </h3>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              New administrators receive the standard ADMIN role. Shop ownership is optional during account creation.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3"><FaUserShield className="mt-1" /> Manage assigned shop operations</li>
              <li className="flex items-start gap-3"><FaUserShield className="mt-1" /> Review shop analytics</li>
              <li className="flex items-start gap-3"><FaUserShield className="mt-1" /> Generate platform reports</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CreateAdmin
