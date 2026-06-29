import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"
import { adminService } from "../../../services/users/admin.service"
import { cambodiaAddress } from "../../../utils/data/cambodiaAddress"

const sectionTitleClass = "mb-6 flex items-center gap-2 text-base font-semibold text-[#020617] dark:text-[#f8fafc]"
const labelClass = "block text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]"
const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"

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
            <div className="px-3 py-2 text-sm text-[#64748b] dark:text-[#a1a1aa] italic">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

function ShopSettings() {
  const [form, setForm] = useState({ 
    name: "", 
    billingPhone: "", 
    provinceKh: "",
    provinceEn: "",
    districtKh: "",
    districtEn: "",
    communeKh: "",
    communeEn: "",
    village: "",
    addressDetail: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    adminService.shop()
      .then((response) => setForm((current) => ({ ...current, ...response.data.result })))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
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
        ...form,
        fullAddressKh,
        fullAddressEn
      }

      const response = await adminService.updateShop(payload)
      setForm((current) => ({ ...current, ...response.data.result }))
      toast.success("Shop settings updated")
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to update shop")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProv = cambodiaAddress.find(p => p.nameKm === form.provinceKh || p.nameEn === form.provinceEn)
  const availableDistricts = selectedProv?.districts || []
  
  const selectedDist = availableDistricts.find(d => d.nameKm === form.districtKh || d.nameEn === form.districtEn)
  const availableCommunes = selectedDist?.communes || []
  
  const selectedComm = availableCommunes.find(c => c.nameKm === form.communeKh || c.nameEn === form.communeEn)

  return (
    <section className="mx-auto w-full max-w-4xl min-w-0 pb-10">
      <div className="w-full">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#06b6d4]">Configuration</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#020617] dark:text-[#f8fafc]">Shop Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]">
            Update the shop profile used across admin, reporting, and receipt workflows.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-10 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 shadow-none sm:p-6 md:p-8">
          <section>
            <SectionTitle>Shop Profile</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Shop Name *</span>
                <input required className={inputClass} placeholder="Enter shop name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Phone</span>
                <input className={inputClass} placeholder="Enter phone number" value={form.billingPhone || ""} onChange={(e) => setForm({ ...form, billingPhone: e.target.value })} />
              </label>
            </div>
          </section>

          <section>
            <SectionTitle>Shop Address</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Province / Capital *</span>
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
                  placeholder="Select Province / Capital"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>District / Khan *</span>
                <Combobox
                  valueObj={selectedDist}
                  onChange={(opt) => setForm({ 
                    ...form, 
                    districtKh: opt?.nameKm || "", districtEn: opt?.nameEn || "", 
                    communeKh: "", communeEn: "", 
                    village: "" 
                  })}
                  options={availableDistricts}
                  placeholder="Select District / Khan"
                  disabled={!form.provinceKh}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Commune / Sangkat</span>
                <Combobox
                  valueObj={selectedComm}
                  onChange={(opt) => setForm({ 
                    ...form, 
                    communeKh: opt?.nameKm || "", communeEn: opt?.nameEn || "", 
                    village: "" 
                  })}
                  options={availableCommunes}
                  placeholder="Select Commune / Sangkat"
                  disabled={!form.districtKh}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClass}>Village</span>
                <input className={inputClass} placeholder="Village name (Optional)" value={form.village || ""} onChange={(e) => setForm({ ...form, village: e.target.value })} />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={labelClass}>Detailed Address</span>
                <input className={inputClass} placeholder="House number, street, market name, nearby landmark..." value={form.addressDetail || ""} onChange={(e) => setForm({ ...form, addressDetail: e.target.value })} />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] pt-8 sm:flex-row sm:items-center sm:justify-end">
            <button
              className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center w-full sm:w-auto"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ShopSettings
