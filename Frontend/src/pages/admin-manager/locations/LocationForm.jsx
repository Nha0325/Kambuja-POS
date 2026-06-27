import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { FaCircleInfo, FaStore, FaShieldHalved, FaCheck } from "react-icons/fa6"
import { locationService } from "../../../services/location.service"
import { api } from "../../../configs/api"
import { formatApiError } from "../../../utils/formatApiError"

const createInitialForm = () => ({
  name: "",
  code: "",
  type: "Branch",
  province: "",
  district: "",
  commune: "",
  village: "",
  addressDetail: "",
  shop: "",
  status: "ACTIVE"
})

const labelClass = "block text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa] mb-2"
const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
const selectClass = `${inputClass} appearance-none cursor-pointer`

function LocationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(createInitialForm)
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setIsLoading(true)
        const [shopsRes, locRes] = await Promise.all([
          api.get("/admin-manager/shops"),
          id ? locationService.getById(id).catch(() => api.get(`/admin-manager/locations/${id}`)) : Promise.resolve(null),
        ])

        if (!isMounted) return
        setShops(shopsRes.data?.result || shopsRes.data?.data || [])

        if (locRes) {
          const loc = locRes.data?.result || locRes.data?.data || locRes.data || {}
          setForm({
            name: loc.name || "",
            code: loc.code || "",
            type: loc.type || "Branch",
            province: loc.province || "",
            district: loc.district || "",
            commune: loc.commune || "",
            village: loc.village || "",
            addressDetail: loc.addressDetail || "",
            shop: loc.shop?._id || loc.shop || "",
            status: loc.status || "ACTIVE"
          })
        }
      } catch (loadError) {
        if (isMounted) setError(loadError.response?.data?.message || loadError.response?.data?.error || "Unable to load location form")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [id])

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.name || !form.shop) {
      setError("Please fill all required fields (Name, Shop).")
      return
    }

    try {
      setIsSaving(true)
      const payload = { ...form }
      if (!payload.shop) delete payload.shop

      if (id) await locationService.update(id, payload)
      else await locationService.create(payload)
      
      toast.success(id ? "Location updated" : "Location created")
      navigate("/admin-manager/locations")
    } catch (submitError) {
      if (submitError?.response?.status === 401) return
      const message = submitError.response?.data?.message || formatApiError(submitError) || "Unable to save location"
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <h2 className="font-semibold text-3xl text-[#020617] dark:text-[#f8fafc] mb-6">Loading form...</h2>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-medium text-[#64748b] dark:text-[#a1a1aa] mb-2 items-center">
            <Link to="/admin-manager" className="hover:text-[#7033ff] transition-colors">Admin Manager</Link>
            <span>/</span>
            <Link to="/admin-manager/locations" className="hover:text-[#7033ff] transition-colors">Locations</Link>
            <span>/</span>
            <span className="text-[#7033ff] font-bold">{id ? "Edit" : "Create"}</span>
          </nav>
          <h2 className="font-semibold text-2xl sm:text-3xl text-[#020617] dark:text-[#f8fafc] tracking-tight">{id ? "Edit Location" : "Create Location"}</h2>
          <p className="text-[#64748b] dark:text-[#a1a1aa] mt-1 text-sm">Register a new physical outlet or management hub to the enterprise system.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin-manager/locations" className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center">
            Cancel
          </Link>
          <button 
            type="submit" 
            form="location-form"
            disabled={isSaving}
            className="bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <FaCheck />
            {isSaving ? "Saving..." : "Save Location"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Bento Grid Form */}
      <form id="location-form" onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Details Card */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111113] rounded-xl p-5 md:p-8 border border-[#e5e7eb] dark:border-[#27272a] shadow-none">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
            <div className="w-10 h-10 rounded-full bg-[#7033ff]/10 flex items-center justify-center text-[#7033ff]">
              <FaCircleInfo className="text-lg" />
            </div>
            <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">Location Details</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className={labelClass}>Location Name *</label>
              <input
                required
                className={inputClass}
                placeholder="e.g. Toul Kork Branch"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Location Code</label>
              <input
                className={inputClass}
                placeholder="e.g. BR-001"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Type</label>
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Branch">Branch</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Store">Store</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Province/City</label>
              <input
                className={inputClass}
                placeholder="e.g. Phnom Penh"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>District/Khan</label>
              <input
                className={inputClass}
                placeholder="e.g. Chamkar Mon"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Commune/Sangkat</label>
              <input
                className={inputClass}
                placeholder="e.g. Boeng Keng Kang I"
                value={form.commune}
                onChange={(e) => setForm({ ...form, commune: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Village</label>
              <input
                className={inputClass}
                placeholder="e.g. Phum 1"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Address Detail</label>
              <textarea
                className={`${inputClass} h-auto py-3 resize-none`}
                rows="3"
                placeholder="Enter specific house number, street name, and landmarks..."
                value={form.addressDetail}
                onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shop Assignment Card */}
          <div className="bg-white dark:bg-[#111113] rounded-xl p-5 md:p-6 border border-[#e5e7eb] dark:border-[#27272a] shadow-none">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="w-10 h-10 rounded-full bg-[#7033ff]/10 flex items-center justify-center text-[#7033ff]">
                <FaStore className="text-lg" />
              </div>
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">Shop Assignment</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Assign to Shop *</label>
                <select
                  required
                  className={selectClass}
                  value={form.shop}
                  onChange={(e) => setForm({ ...form, shop: e.target.value })}
                >
                  <option value="">Select a Shop</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name} ({shop.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-[#7033ff]/5 rounded-xl border border-[#7033ff]/10">
                <p className="text-xs text-[#7033ff] leading-relaxed font-medium">Assigning a location to a shop allows managers to track inventory and sales data specifically for this physical space.</p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white dark:bg-[#111113] rounded-xl p-5 md:p-6 border border-[#e5e7eb] dark:border-[#27272a] shadow-none">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <FaShieldHalved className="text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">Status</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                form.status === 'ACTIVE' 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                  : "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400"
              }`}>
                {form.status}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setForm({...form, status: 'ACTIVE'})}
                className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all text-sm ${
                  form.status === 'ACTIVE'
                    ? "border-[#7033ff] bg-[#7033ff]/5 text-[#7033ff]"
                    : "border-transparent bg-slate-50 dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                Active
              </button>
              <button 
                type="button"
                onClick={() => setForm({...form, status: 'INACTIVE'})}
                className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all text-sm ${
                  form.status === 'INACTIVE'
                    ? "border-[#64748b] dark:border-[#a1a1aa] bg-slate-50 dark:bg-[#09090b] text-[#020617] dark:text-[#f8fafc]"
                    : "border-transparent bg-slate-50 dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default LocationForm
