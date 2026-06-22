import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { adminService } from "../../services/admin.service"

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
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold">Shop Settings</h1>
      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-4 border border-gray-200 bg-white p-5 sm:grid-cols-2">
        {[
          ["name", "Name"],
          ["phone", "Phone"],
          ["address", "Address"],
          ["province", "Province"],
          ["city", "City"],
        ].map(([name, label]) => (
          <label key={name} className="form-control">
            <span className="mb-1 text-sm">{label}</span>
            <input className="input input-bordered" value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} />
          </label>
        ))}
        <div className="flex justify-end sm:col-span-2">
          <button className="btn btn-sm btn-neutral" type="submit">Save</button>
        </div>
      </form>
    </section>
  )
}

export default ShopSettings
