import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { adminService } from "../../services/admin.service"
import { adminSurface } from "./adminPageUi"

function ShopSettings() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", province: "", city: "" })

  useEffect(() => {
    adminService.shop()
      .then((response) => setForm((current) => ({ ...current, ...response.data.result })))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      const response = await adminService.updateShop(form)
      setForm((current) => ({ ...current, ...response.data.result }))
      toast.success("Shop settings updated")
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to update shop")
    }
  }

  return (
    <section className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Configuration</p>
          <h1 className={adminSurface.title}>Shop Settings</h1>
          <p className={adminSurface.description}>
            Update the shop profile used across admin, reporting, and receipt workflows.
          </p>
        </div>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Shop", form.name || "-"],
          ["Phone", form.phone || "-"],
          ["Province", form.province || "-"],
          ["City", form.city || "-"],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className="mt-3 truncate text-xl font-bold text-[#0b1c30]">{value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className={`${adminSurface.card} grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2`}>
        {[
          ["name", "Name"],
          ["phone", "Phone"],
          ["address", "Address"],
          ["province", "Province"],
          ["city", "City"],
        ].map(([name, label]) => (
          <label key={name} className="form-control">
            <span className="mb-2 text-sm font-semibold text-[#0b1c30]">{label}</span>
            <input className={`${adminSurface.input} h-12 w-full`} value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} />
          </label>
        ))}
        <div className="flex justify-end sm:col-span-2">
          <button className={adminSurface.primaryButton} type="submit">Save</button>
        </div>
      </form>
    </section>
  )
}

export default ShopSettings
