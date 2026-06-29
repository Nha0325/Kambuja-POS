import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { FaCircleInfo, FaUserShield } from "react-icons/fa6"
import { adminManagerService } from "../../../services/users/adminManager.service"
import {
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "../adminManagerUi"
import { PageHeader } from "../../../components/admin/AdminManagerUi"

const getShopLocation = (shop) => {
  if (!shop || typeof shop !== "object") return "-"
  return [
    shop.provinceName || shop.province,
    shop.districtName || shop.city,
  ].filter(Boolean).join(", ") || "-"
}

const EmailAutocompleteInput = ({ value, onChange, placeholder, required }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewEmail, setPreviewEmail] = useState("")
  
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com']
  
  const getSuggestions = () => {
    if (!value || !value.trim()) return []
    const parts = value.split('@')
    if (parts.length > 2) return [] // invalid
    
    const localPart = parts[0]
    const domainPart = parts[1] || ''
    
    if (value.includes('@')) {
      const filtered = domains.filter(d => d.startsWith(domainPart))
      // If user typed the exact domain already, don't show suggestion to avoid clutter
      if (filtered.length === 1 && filtered[0] === domainPart) return []
      return filtered.map(d => `${localPart}@${d}`)
    } else {
      return domains.map(d => `${localPart}@${d}`)
    }
  }

  const suggestions = getSuggestions()

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (activeIndex + 1) % suggestions.length
      setActiveIndex(nextIndex)
      setPreviewEmail(suggestions[nextIndex])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = (activeIndex - 1 + suggestions.length) % suggestions.length
      setActiveIndex(nextIndex)
      setPreviewEmail(suggestions[nextIndex])
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      onChange({ target: { value: suggestions[activeIndex] } })
      setShowSuggestions(false)
      setPreviewEmail("")
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setPreviewEmail("")
    }
  }

  return (
    <div className="relative">
      <input
        type="email"
        required={required}
        value={previewEmail || value}
        onChange={(e) => {
          onChange(e)
          setShowSuggestions(true)
          setActiveIndex(0)
          setPreviewEmail("")
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="email"
        className={inputClass}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          className="absolute z-50 w-full mt-1 bg-white dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg shadow-sm max-h-60 overflow-auto py-1"
          onMouseLeave={() => setPreviewEmail("")}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${idx === activeIndex ? 'bg-[#06b6d4]/10 text-[#06b6d4] font-medium' : 'text-[#020617] dark:text-[#f8fafc] hover:bg-slate-50 dark:hover:bg-[#09090b]'}`}
              onMouseDown={(e) => {
                e.preventDefault() // prevent blur before click registers
                onChange({ target: { value: s } })
                setShowSuggestions(false)
                setPreviewEmail("")
              }}
              onMouseEnter={() => {
                setActiveIndex(idx)
                setPreviewEmail(s)
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CreateAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shops, setShops] = useState([])
  const [form, setForm] = useState({ username: "", fullName: "", email: "", phone: "", password: "", shopId: "", status: "ACTIVE", role: "ADMIN" })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successSummary, setSuccessSummary] = useState(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const fetchShops = adminManagerService.getShops()
      .then((response) => {
         if (isMounted) setShops((response.data.result || []).filter((shop) => shop.status === "ACTIVE"))
      })

    const fetchAdmin = id 
      ? adminManagerService.getAdmin(id).then(res => {
          if (isMounted && res.data.result) {
            const admin = res.data.result
            setForm({
              username: admin.username || "",
              fullName: admin.fullName || "",
              email: admin.email || "",
              phone: admin.phone || "",
              password: "",
              shopId: admin.shopId?._id || admin.shopId || "",
              status: admin.status || "ACTIVE",
              role: admin.role || "ADMIN"
            })
          }
        })
      : Promise.resolve()

    Promise.all([fetchShops, fetchAdmin])
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
      
    return () => { isMounted = false }
  }, [id])

  const submit = async (event) => {
    event.preventDefault()
    try {
      setIsSaving(true)
      const selectedShop = shops.find((shop) => shop._id === form.shopId)
      
      const payload = { ...form }
      if (id && !payload.password) {
        delete payload.password
      }
      
      if (id) {
        await adminManagerService.updateAdmin(id, payload)
        toast.success("Admin owner updated")
        navigate("/admin-manager/admin-owners")
      } else {
        const response = await adminManagerService.createAdmin(payload)
        const admin = response.data.result || {}
        setSuccessSummary({
          adminName: admin.fullName || admin.username || form.fullName || form.username,
          username: admin.username || form.username,
          email: admin.email || form.email,
          phone: admin.phone || form.phone,
          assignedShop: selectedShop?.name || "Unassigned",
          shopLocation: getShopLocation(selectedShop),
          temporaryPassword: form.password,
          status: admin.status || form.status,
          role: admin.role || form.role,
          loginUrl: typeof window === "undefined" ? "/login" : `${window.location.origin}/login`,
        })
        setForm({ username: "", fullName: "", email: "", phone: "", password: "", shopId: "", status: "ACTIVE", role: "ADMIN" })
        toast.success("Admin owner created")
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to save admin owner")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
       <div className="p-10 text-center text-[#64748b]">Loading...</div>
    )
  }

  return (
    <section>
      <PageHeader
        title={id ? "Edit Admin Owner" : "Create Admin Owner"}
        description={id ? "Update admin details and shop assignment." : "Register a shop owner admin account for the Kambuja ecosystem."}
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <form onSubmit={submit} className={`${cardClass} space-y-8 p-6 md:p-8 lg:col-span-8`}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            <label className="space-y-2">
              <span className={labelClass}>Username *</span>
              <input
                required
                type="text"
                className={inputClass}
                placeholder="e.g. sokha_admin"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Full Name</span>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Sokha Chhuon"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Email Address *</span>
              <EmailAutocompleteInput
                required
                placeholder="example@gmail.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Phone Number</span>
              <input
                type="tel"
                className={inputClass}
                placeholder="+855 12 345 678"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Password {id ? "(Leave blank to keep)" : "*"}</span>
              <input
                required={!id}
                type="password"
                autoComplete="new-password"
                className={inputClass}
                placeholder="********"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Assign Shop Optional</span>
              <select className={selectClass} value={form.shopId} onChange={(event) => setForm({ ...form, shopId: event.target.value })}>
                <option value="">Unassigned admin owner</option>
                {shops.map((shop) => <option key={shop._id} value={shop._id}>{shop.name}</option>)}
              </select>
              <span className="block text-xs leading-5 text-slate-500">Unassigned admins can be selected as a new shop owner.</span>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Role *</span>
              <select className={selectClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="ADMIN">Shop Admin (ADMIN)</option>
                <option value="ADMIN_MANAGER">System Admin (ADMIN_MANAGER)</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Status</span>
              <select className={selectClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-cyan-100 pt-6 sm:flex-row sm:justify-end">
            <Link className={`${secondaryButtonClass} w-full sm:w-auto`} to="/admin-manager/admin-owners">Cancel</Link>
            <button className={`${primaryButtonClass} w-full sm:w-auto`} type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : (id ? "Update Admin Owner" : "Save Admin Owner")}
            </button>
          </div>
        </form>

        <aside className="space-y-6 lg:col-span-4">
          {successSummary && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-6">
              <h3 className="mb-3 text-base font-semibold text-emerald-900 dark:text-emerald-400">Admin Owner Created</h3>
              <p className="mb-4 text-sm leading-6 text-emerald-700 dark:text-emerald-500/80">
                Temporary password is shown once on this screen.
              </p>
              <dl className="space-y-3 text-sm">
                {[
                  ["Admin name", successSummary.adminName],
                  ["Username", successSummary.username],
                  ["Role", successSummary.role],
                  ["Email", successSummary.email],
                  ["Assigned shop", successSummary.assignedShop],
                  ["Shop location", successSummary.shopLocation],
                  ["Temporary password", successSummary.temporaryPassword],
                  ["Login URL", successSummary.loginUrl],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase tracking-[0.05em] text-emerald-600 dark:text-emerald-500/60">{label}</dt>
                    <dd className="mt-1 break-words font-semibold text-emerald-900 dark:text-emerald-400">{value || "-"}</dd>
                  </div>
                ))}
              </dl>
              <Link className={`${secondaryButtonClass} mt-5 w-full justify-center`} to="/admin-manager/admin-owners">
                Back to Admin Owners
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-slate-50 dark:bg-[#09090b] p-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#020617] dark:text-[#f8fafc]">
              <FaCircleInfo className="text-[#06b6d4]" />
              Role Permissions
            </h3>
            <p className="mb-4 text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]">
              <strong>ADMIN:</strong> Manage assigned shop operations, analytics, and reports.<br/>
              <strong>ADMIN_MANAGER:</strong> Full system access across all shops.
            </p>
            <ul className="space-y-3 text-sm text-[#020617] dark:text-[#f8fafc]">
              <li className="flex items-start gap-3"><FaUserShield className="mt-1 text-[#06b6d4]" /> Manage assigned shop operations</li>
              <li className="flex items-start gap-3"><FaUserShield className="mt-1 text-[#06b6d4]" /> Review shop analytics</li>
              <li className="flex items-start gap-3"><FaUserShield className="mt-1 text-[#06b6d4]" /> View assigned shop reports</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CreateAdmin
