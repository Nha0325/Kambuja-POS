import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { FaCircleInfo, FaStore, FaShieldHalved, FaCheck } from "react-icons/fa6"
import { locationService } from "../../../services/system/location.service"
import { api } from "../../../utils/config/api"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import { useTranslation } from "react-i18next"

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
const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
const selectClass = `${inputClass} appearance-none cursor-pointer`

function LocationForm() {
  const { t } = useTranslation()
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
        if (isMounted) setError(loadError.response?.data?.message || loadError.response?.data?.error || t('unable_to_load_location_form'))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [id, t])

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.name || !form.shop) {
      setError(t('fill_required_fields_location'))
      return
    }

    try {
      setIsSaving(true)
      const payload = { ...form }
      if (!payload.shop) delete payload.shop

      if (id) await locationService.update(id, payload)
      else await locationService.create(payload)
      
      toast.success(id ? t('location_updated') : t('location_created'))
      navigate("/admin-manager/locations")
    } catch (submitError) {
      if (submitError?.response?.status === 401) return
      const message = submitError.response?.data?.message || formatApiError(submitError) || t('unable_to_save_location')
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <h2 className="font-semibold text-3xl text-[#020617] dark:text-[#f8fafc] mb-6">{t('loading_form')}</h2>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-medium text-[#64748b] dark:text-[#a1a1aa] mb-2 items-center">
            <Link to="/admin-manager" className="hover:text-[#06b6d4] transition-colors">{t('admin_manager')}</Link>
            <span>/</span>
            <Link to="/admin-manager/locations" className="hover:text-[#06b6d4] transition-colors">{t('locations')}</Link>
            <span>/</span>
            <span className="text-[#06b6d4] font-bold">{id ? t('edit') : t('create')}</span>
          </nav>
          <h2 className="font-semibold text-2xl sm:text-3xl text-[#020617] dark:text-[#f8fafc] tracking-tight">{id ? t('edit_location') : t('create_location')}</h2>
          <p className="text-[#64748b] dark:text-[#a1a1aa] mt-1 text-sm">{t('register_location_desc')}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin-manager/locations" className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center">
            {t('cancel')}
          </Link>
          <button 
            type="submit" 
            form="location-form"
            disabled={isSaving}
            className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <FaCheck />
            {isSaving ? t('saving') : t('save_location')}
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
            <div className="w-10 h-10 rounded-full bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
              <FaCircleInfo className="text-lg" />
            </div>
            <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{t('location_details')}</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('location_name_req')}</label>
              <input
                required
                className={inputClass}
                placeholder={t('eg_location_name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>{t('location_code')}</label>
              <input
                className={inputClass}
                placeholder={t('eg_location_code')}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>{t('type')}</label>
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Branch">{t('branch')}</option>
                <option value="Warehouse">{t('warehouse')}</option>
                <option value="Store">{t('store')}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('province_city')}</label>
              <input
                className={inputClass}
                placeholder={t('eg_province')}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>{t('district_khan')}</label>
              <input
                className={inputClass}
                placeholder={t('eg_district')}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>{t('commune_sangkat')}</label>
              <input
                className={inputClass}
                placeholder={t('eg_commune')}
                value={form.commune}
                onChange={(e) => setForm({ ...form, commune: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>{t('village')}</label>
              <input
                className={inputClass}
                placeholder={t('eg_village')}
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>{t('address_detail')}</label>
              <textarea
                className={`${inputClass} h-auto py-3 resize-none`}
                rows="3"
                placeholder={t('address_placeholder')}
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
              <div className="w-10 h-10 rounded-full bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
                <FaStore className="text-lg" />
              </div>
              <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{t('shop_assignment')}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t('assign_to_shop_req')}</label>
                <select
                  required
                  className={selectClass}
                  value={form.shop}
                  onChange={(e) => setForm({ ...form, shop: e.target.value })}
                >
                  <option value="">{t('select_a_shop')}</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name} ({shop.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-[#06b6d4]/5 rounded-xl border border-[#06b6d4]/10">
                <p className="text-xs text-[#06b6d4] leading-relaxed font-medium">{t('shop_assignment_desc')}</p>
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
                <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{t('status')}</h3>
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
                    ? "border-[#06b6d4] bg-[#06b6d4]/5 text-[#06b6d4]"
                    : "border-transparent bg-slate-50 dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa] hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {t('active')}
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
                {t('inactive')}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default LocationForm
