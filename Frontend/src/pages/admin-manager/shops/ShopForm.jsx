import { useEffect, useState, useRef } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import { adminManagerService } from "../../../services/users/adminManager.service"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import { cambodiaAddress } from "../../../utils/data/cambodiaAddress"
import { useTranslation } from "react-i18next"

const createInitialForm = () => ({
  name: "",
  code: "",
  ownerAdminId: "",
  billingEmail: "",
  subscriptionPlan: "Free",
  posAccess: true,
  defaultCurrency: "USD",
  defaultTax: 0,
  status: "ACTIVE",
  provinceKh: "",
  provinceEn: "",
  districtKh: "",
  districtEn: "",
  communeKh: "",
  communeEn: "",
  village: "",
  addressDetail: "",
})

const getShopId = (shopId) => {
  if (!shopId) return ""
  return typeof shopId === "string" ? shopId : shopId._id
}

const sectionTitleClass = "mb-6 flex items-center gap-2 text-base font-semibold text-[#020617] dark:text-[#f8fafc]"
const labelClass = "block text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]"
const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
const readOnlyInputClass = `${inputClass} opacity-60 cursor-not-allowed`
const selectClass = inputClass
const SectionTitle = ({ children }) => (
  <h3 className={sectionTitleClass}>
    <span className="h-5 w-1 rounded-full bg-[#06b6d4]" />
    {children}
  </h3>
)

const Combobox = ({ valueObj, onChange, options, placeholder, disabled, required }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef(null)

  const displayValue = valueObj && valueObj.nameKm ? `${valueObj.nameKm} / ${valueObj.nameEn}` : ""

  useEffect(() => {
    setSearch(displayValue)
  }, [displayValue])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch(displayValue)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [displayValue])

  const filteredOptions = options.filter(opt => {
    const s = search.toLowerCase()
    return (opt.nameKm && opt.nameKm.toLowerCase().includes(s)) ||
           (opt.nameEn && opt.nameEn.toLowerCase().includes(s)) ||
           `${opt.nameKm} / ${opt.nameEn}`.toLowerCase().includes(s)
  })

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className={inputClass}
          placeholder={placeholder}
          value={search}
          disabled={disabled}
          required={required && !displayValue}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
            if (displayValue && e.target.value !== displayValue) {
              onChange(null) 
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a1a1aa] pointer-events-none text-xl">
          expand_more
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg shadow-sm max-h-[240px] overflow-y-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.code}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${valueObj?.code === opt.code ? 'bg-[#06b6d4]/10 text-[#06b6d4] font-medium' : 'text-[#020617] dark:text-[#f8fafc] hover:bg-slate-50 dark:hover:bg-[#09090b]'}`}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
              >
                {opt.nameKm} / {opt.nameEn}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-[#64748b] dark:text-[#a1a1aa] italic">{placeholder === 'No results found' ? placeholder : 'No results found'}</div>
          )}
        </div>
      )}
    </div>
  )
}

function ShopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(createInitialForm)
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const { t } = useTranslation()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setIsLoading(true)
        const [adminsResponse, shopResponse] = await Promise.all([
          id ? adminManagerService.getAdmins() : adminManagerService.availableAdmins(),
          id ? adminManagerService.getShopById(id) : Promise.resolve(null),
        ])

        if (!isMounted) return

        const adminDocs = adminsResponse.data.result || []
        if (shopResponse) {
          const shop = shopResponse.data.result || {}
          const ownerAdminId = shop.ownerAdminId?._id || shop.ownerAdminId || ""
          setForm({
            ...createInitialForm(),
            name: shop.name || "",
            code: shop.code || "",
            ownerAdminId,
            billingEmail: shop.billingEmail || "",
            subscriptionPlan: shop.subscriptionPlan || "Free",
            posAccess: shop.posAccess !== undefined ? shop.posAccess : true,
            status: shop.status || "ACTIVE",
            defaultCurrency: shop.defaultCurrency || "USD",
            defaultTax: shop.defaultTax || 0,
            provinceKh: shop.provinceKh || "",
            provinceEn: shop.provinceEn || "",
            districtKh: shop.districtKh || "",
            districtEn: shop.districtEn || "",
            communeKh: shop.communeKh || "",
            communeEn: shop.communeEn || "",
            village: shop.village || "",
            addressDetail: shop.addressDetail || "",
          })
          setAdmins(adminDocs.filter((admin) => {
            const assignedShopId = getShopId(admin.shopId)
            return admin.status === "ACTIVE"
              && (!assignedShopId || assignedShopId === id || admin._id === ownerAdminId)
          }))
        } else {
          setAdmins(adminDocs)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.response?.data?.error || t('unable_to_load_shop_form'))
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [id, t])

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.name.trim() || !form.ownerAdminId || !form.provinceKh.trim() || !form.districtKh.trim()) {
      setError(t('shop_form_required_fields'))
      return
    }

    try {
      setIsSaving(true)
      const fullAddressKh = [
        form.addressDetail,
        form.village,
        form.communeKh,
        form.districtKh,
        form.provinceKh
      ].map(s => s?.trim()).filter(Boolean).join(", ")

      const fullAddressEn = [
        form.addressDetail,
        form.village,
        form.communeEn,
        form.districtEn,
        form.provinceEn
      ].map(s => s?.trim()).filter(Boolean).join(", ")

      const payload = {
        name: form.name.trim(),
        ownerAdminId: form.ownerAdminId,
        billingEmail: form.billingEmail.trim(),
        subscriptionPlan: form.subscriptionPlan,
        posAccess: form.posAccess,
        status: form.status,
        defaultCurrency: form.defaultCurrency,
        defaultTax: Number(form.defaultTax),
        provinceKh: form.provinceKh.trim(),
        provinceEn: form.provinceEn.trim(),
        districtKh: form.districtKh.trim(),
        districtEn: form.districtEn.trim(),
        communeKh: form.communeKh.trim(),
        communeEn: form.communeEn.trim(),
        village: form.village.trim(),
        addressDetail: form.addressDetail.trim(),
        fullAddressKh,
        fullAddressEn
      }

      if (id) {
        await adminManagerService.updateShop(id, payload)
        toast.success(t('shop_updated'))
      } else {
        await adminManagerService.createShop(payload)
        toast.success(t('shop_created_successfully'))
      }
      window.dispatchEvent(new Event("refetchNotifications"))
      navigate("/admin-manager/shops")
    } catch (submitError) {
      if (submitError?.response?.status === 401) return
      const message = formatApiError(submitError) || t('unable_to_save_shop')
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-4xl min-w-0 pb-10">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#020617] dark:text-[#f8fafc]">{id ? t('edit_shop') : t('create_shop')}</h1>
          <div className="mt-6 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-10 text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('loading_shop_form')}</div>
        </div>
      </section>
    )
  }

  const noOwnerAdmin = admins.length === 0

  const selectedProv = cambodiaAddress.find(p => p.nameKm === form.provinceKh || p.nameEn === form.provinceEn)
  const availableDistricts = selectedProv?.districts || []
  
  const selectedDist = availableDistricts.find(d => d.nameKm === form.districtKh || d.nameEn === form.districtEn)
  const availableCommunes = selectedDist?.communes || []
  
  const selectedComm = availableCommunes.find(c => c.nameKm === form.communeKh || c.nameEn === form.communeEn)
  return (
    <section className="mx-auto w-full max-w-4xl min-w-0 pb-10">
      <div className="w-full">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link to="/admin-manager/shops" className="hover:text-[#06b6d4]">{t('all_shops')}</Link>
          <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{id ? t('edit_shop') : t('create_shop')}</span>
        </nav>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#06b6d4]">Kambuja POS</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#020617] dark:text-[#f8fafc]">{id ? t('edit_shop') : t('create_shop')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]">
            {t('shop_form_desc')}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-10 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 shadow-none sm:p-6 md:p-8">
          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <section>
            <SectionTitle>{t('shop_business_account')}</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>{t('shop_name_req')}</span>
                <input required className={inputClass} placeholder={t('enter_shop_name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('auto_shop_code')}</span>
                <input readOnly className={readOnlyInputClass} value={form.code} placeholder={t('auto_generated_code')} />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('owner_admin_req')}</span>
                <select required disabled={noOwnerAdmin} className={selectClass} value={form.ownerAdminId} onChange={(e) => setForm({ ...form, ownerAdminId: e.target.value })}>
                  <option value="">{t('select_admin_owner')}</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>{admin.username} ({admin.email})</option>
                  ))}
                </select>
                {noOwnerAdmin && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#64748b] dark:text-[#a1a1aa]">{t('no_available_admins')}</span>
                    <Link className="font-bold text-[#06b6d4] underline underline-offset-2 hover:opacity-80 transition-opacity" to="/admin-manager/admin-owners/create">{t('create_admin_owner')}</Link>
                  </div>
                )}
              </label>


              <label className="space-y-2">
                <span className={labelClass}>{t('billing_email')}</span>
                <input type="email" className={inputClass} placeholder="billing@company.com" value={form.billingEmail} onChange={(e) => setForm({ ...form, billingEmail: e.target.value })} />
              </label>
              
              <label className="space-y-2">
                <span className={labelClass}>{t('subscription_plan')}</span>
                <select className={selectClass} value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>
                  <option value="Free">{t('free')}</option>
                  <option value="Basic">{t('basic')}</option>
                  <option value="Pro">{t('pro')}</option>
                </select>
              </label>
              
              <label className="space-y-2">
                <span className={labelClass}>{t('shop_status')}</span>
                <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">{t('active')}</option>
                  <option value="LOCKED">{t('locked')}</option>
                  <option value="SUSPENDED">{t('suspended')}</option>
                  <option value="EXPIRED">{t('expired')}</option>
                </select>
              </label>


              <label className="space-y-2">
                <span className={labelClass}>{t('default_currency')}</span>
                <select className={selectClass} value={form.defaultCurrency} onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}>
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('default_tax')}</span>
                <input type="number" min="0" step="0.1" className={inputClass} value={form.defaultTax} onChange={(e) => setForm({ ...form, defaultTax: e.target.value })} />
              </label>
            </div>
            

          </section>

          <section>
            <SectionTitle>{t('shop_address')}</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>{t('province_req')}</span>
                <Combobox
                  valueObj={selectedProv}
                  onChange={(opt) => setForm({ 
                    ...form, 
                    provinceKh: opt?.nameKm || "", provinceEn: opt?.nameEn || "", 
                    districtKh: "", districtEn: "", 
                    communeKh: "", communeEn: "", 
                    village: "" 
                  })}
                  options={cambodiaAddress}
                  placeholder={t('select_province')}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('district_req')}</span>
                <Combobox
                  valueObj={selectedDist}
                  onChange={(opt) => setForm({ 
                    ...form, 
                    districtKh: opt?.nameKm || "", districtEn: opt?.nameEn || "", 
                    communeKh: "", communeEn: "", 
                    village: "" 
                  })}
                  options={availableDistricts}
                  placeholder={t('select_district')}
                  disabled={!form.provinceKh}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('commune_opt')}</span>
                <Combobox
                  valueObj={selectedComm}
                  onChange={(opt) => setForm({ 
                    ...form, 
                    communeKh: opt?.nameKm || "", communeEn: opt?.nameEn || "", 
                    village: "" 
                  })}
                  options={availableCommunes}
                  placeholder={t('select_commune')}
                  disabled={!form.districtKh}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>{t('village')}</span>
                <input className={inputClass} placeholder={t('village_placeholder')} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={labelClass}>{t('detailed_address')}</span>
                <input className={inputClass} placeholder={t('address_placeholder')} value={form.addressDetail} onChange={(e) => setForm({ ...form, addressDetail: e.target.value })} />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] pt-8 sm:flex-row sm:items-center sm:justify-end">
            <Link className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center w-full sm:w-auto" to="/admin-manager/shops">{t('cancel')}</Link>
            <button
              className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center w-full sm:w-auto"
              type="submit"
              disabled={isSaving || noOwnerAdmin}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ShopForm
