import { useState, useEffect, useRef } from "react"
import { FaGlobe, FaBell, FaDatabase, FaShieldHalved, FaCreditCard } from "react-icons/fa6"
import { PageHeader } from "../../../components/admin/AdminManagerUi"
import { cardClass } from "../adminManagerUi"
import toast from "react-hot-toast"
import { adminManagerService } from "../../../services/users/adminManager.service"
import { useTranslation } from "react-i18next"

const customInputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#09090b] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
const customInputErrorClass = "h-10 w-full rounded-lg border border-red-300 dark:border-red-500/50 bg-white dark:bg-[#09090b] px-3 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
const customSelectClass = customInputClass
const customPrimaryButton = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06b6d4] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed"

const Badge = ({ status }) => {
  const { t } = useTranslation()
  if (status === "Working" || status === "Auto-save") {
    return (
      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
        {status === "Working" ? t('working') : t('auto_save')}
      </span>
    )
  }
  if (status === "Needs API") {
    return (
      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
        {t('needs_api')}
      </span>
    )
  }
  return null
}

const SectionStatus = ({ status }) => {
   const { t } = useTranslation()
   if (status === "Saving...") return <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>{t('saving')}</span>
   if (status === "Saved") return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{t('saved')}</span>
   if (status === "Fix errors") return <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{t('fix_errors')}</span>
   if (status === "Error") return <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{t('error')}</span>
   return <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">-</span>
}

function Settings() {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('kambuja_admin_manager_settings')
    if (saved) {
      try { 
        return {
           platformName: "Kambuja POS",
           supportEmail: "support@kambujapos.com",
           supportPhone: "+855 12 345 678",
           address: "Phnom Penh, Cambodia",
           defaultTrialDays: 14,
           defaultMonthlyPrice: 29.99,
           currency: "USD",
           gracePeriodDays: 3,
           enableTelegramAlerts: false,
           enableLowStockAlerts: true,
           enableSubscriptionExpiryAlerts: true,
           enableAdminActivityAlerts: false,
           requireStrongPassword: true,
           sessionTimeout: 60,
           loginAlertToggle: true,
           ...JSON.parse(saved) 
        } 
      } catch (e) {
        console.error("Failed to parse settings:", e)
      }
    }
    return {
      platformName: "Kambuja POS",
      supportEmail: "support@kambujapos.com",
      supportPhone: "+855 12 345 678",
      address: "Phnom Penh, Cambodia",
      defaultTrialDays: 14,
      defaultMonthlyPrice: 29.99,
      currency: "USD",
      gracePeriodDays: 3,
      enableTelegramAlerts: false,
      enableLowStockAlerts: true,
      enableSubscriptionExpiryAlerts: true,
      enableAdminActivityAlerts: false,
      requireStrongPassword: true,
      sessionTimeout: 60,
      loginAlertToggle: true
    }
  })

  const [status, setStatus] = useState({
      profile: "Saved",
      subscription: "Saved",
      notifications: "Saved",
      security: "Saved"
  })

  const [errors, setErrors] = useState({})
  
  // Track previous valid state to fall back on if invalid
  const validStateRef = useRef(form)

  const [backups, setBackups] = useState([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [loadingBackups, setLoadingBackups] = useState(true)

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true)
      const res = await adminManagerService.backups()
      setBackups(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingBackups(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true)
      await adminManagerService.createBackup()
      toast.success(t('backup_created_successfully'))
      fetchBackups()
    } catch (err) {
      console.error(err)
      toast.error(t('failed_to_create_backup'))
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const validateSection = (section, currentForm) => {
    let errs = {}
    let isValid = true

    if (section === 'profile') {
      if (!currentForm.platformName || !currentForm.platformName.trim()) { errs.platformName = t('required'); isValid = false }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (currentForm.supportEmail && !emailRegex.test(currentForm.supportEmail)) { errs.supportEmail = t('invalid_email'); isValid = false }
      if (!currentForm.supportEmail) { errs.supportEmail = t('required'); isValid = false }
    }
    
    if (section === 'subscription') {
      if (Number(currentForm.defaultTrialDays) < 0 || currentForm.defaultTrialDays === '') { errs.defaultTrialDays = t('must_be_gt_0'); isValid = false }
      if (Number(currentForm.defaultMonthlyPrice) < 0 || currentForm.defaultMonthlyPrice === '') { errs.defaultMonthlyPrice = t('must_be_gt_0'); isValid = false }
      if (Number(currentForm.gracePeriodDays) < 0 || currentForm.gracePeriodDays === '') { errs.gracePeriodDays = t('must_be_gt_0'); isValid = false }
    }

    if (section === 'security') {
      if (Number(currentForm.sessionTimeout) < 5 || currentForm.sessionTimeout === '') { errs.sessionTimeout = t('must_be_gt_5'); isValid = false }
    }

    return { isValid, errs }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      let newStatus = { ...status }
      let newErrors = {}
      let validDataToSave = { ...validStateRef.current }

      // Check Profile
      if (status.profile === "Saving...") {
          const profileVal = validateSection('profile', form)
          if (!profileVal.isValid) {
             newStatus.profile = "Fix errors"
             newErrors = { ...newErrors, ...profileVal.errs }
          } else {
             newStatus.profile = "Saved"
             validDataToSave.platformName = form.platformName
             validDataToSave.supportEmail = form.supportEmail
             validDataToSave.supportPhone = form.supportPhone
             validDataToSave.address = form.address
          }
      }

      // Check Subscription
      if (status.subscription === "Saving...") {
          const subVal = validateSection('subscription', form)
          if (!subVal.isValid) {
             newStatus.subscription = "Fix errors"
             newErrors = { ...newErrors, ...subVal.errs }
          } else {
             newStatus.subscription = "Saved"
             validDataToSave.defaultTrialDays = form.defaultTrialDays
             validDataToSave.defaultMonthlyPrice = form.defaultMonthlyPrice
             validDataToSave.currency = form.currency
             validDataToSave.gracePeriodDays = form.gracePeriodDays
          }
      }

      // Check Security
      if (status.security === "Saving...") {
          const secVal = validateSection('security', form)
          if (!secVal.isValid) {
             newStatus.security = "Fix errors"
             newErrors = { ...newErrors, ...secVal.errs }
          } else {
             newStatus.security = "Saved"
             validDataToSave.requireStrongPassword = form.requireStrongPassword
             validDataToSave.loginAlertToggle = form.loginAlertToggle
             validDataToSave.sessionTimeout = form.sessionTimeout
          }
      }
      
      if (status.notifications === "Saving...") {
          newStatus.notifications = "Saved"
          validDataToSave.enableTelegramAlerts = form.enableTelegramAlerts
          validDataToSave.enableLowStockAlerts = form.enableLowStockAlerts
          validDataToSave.enableSubscriptionExpiryAlerts = form.enableSubscriptionExpiryAlerts
          validDataToSave.enableAdminActivityAlerts = form.enableAdminActivityAlerts
      }

      setErrors(newErrors)
      setStatus(newStatus)
      
      // Update ref and save
      validStateRef.current = validDataToSave
      localStorage.setItem('kambuja_admin_manager_settings', JSON.stringify(validDataToSave))

    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const handleChange = (updates, section) => {
      setForm(prev => ({ ...prev, ...updates }))
      setStatus(prev => ({ ...prev, [section]: "Saving..." }))
  }

  const labelClass = "block font-semibold text-[#64748b] dark:text-[#a1a1aa] mb-2 uppercase tracking-wider text-xs"

  return (
    <section className="max-w-7xl mx-auto pb-12 space-y-6">
      <PageHeader
        title={t('platform_settings')}
        description={t('platform_settings_desc')}
      />
      
      <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 text-[#06b6d4] dark:text-[#a180ff] px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3">
         <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
            <FaGlobe />
         </span>
         {t('settings_auto_save_desc')}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Section 1: Platform Profile */}
          <div className={`${cardClass} p-5 md:p-6`}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] mt-0.5">
                  <FaGlobe className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('platform_profile')}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">{t('platform_profile_desc')}</p>
                </div>
              </div>
              <Badge status="Auto-save" />
            </div>
            
            <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mb-6 bg-[#f8fafc] dark:bg-[#09090b] p-3 rounded-lg border border-[#e5e7eb] dark:border-[#27272a]">
              {t('platform_profile_note')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>{t('platform_name')}</label>
                <input
                  className={errors.platformName ? customInputErrorClass : customInputClass}
                  value={form.platformName}
                  onChange={(e) => handleChange({ platformName: e.target.value }, 'profile')}
                />
                {errors.platformName && <p className="text-xs text-red-500 mt-1">{errors.platformName}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('support_email')}</label>
                <input
                  type="email"
                  className={errors.supportEmail ? customInputErrorClass : customInputClass}
                  value={form.supportEmail}
                  onChange={(e) => handleChange({ supportEmail: e.target.value }, 'profile')}
                />
                {errors.supportEmail && <p className="text-xs text-red-500 mt-1">{errors.supportEmail}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('support_phone')}</label>
                <input
                  className={customInputClass}
                  value={form.supportPhone}
                  onChange={(e) => handleChange({ supportPhone: e.target.value }, 'profile')}
                />
              </div>
              <div>
                <label className={labelClass}>{t('address_description')}</label>
                <input
                  className={customInputClass}
                  value={form.address}
                  onChange={(e) => handleChange({ address: e.target.value }, 'profile')}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
              <SectionStatus status={status.profile} />
            </div>
          </div>

          {/* Section 2: Subscription Defaults */}
          <div className={`${cardClass} p-5 md:p-6`}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 mt-0.5">
                  <FaCreditCard className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('subscription_defaults')}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">{t('subscription_defaults_desc')}</p>
                </div>
              </div>
              <Badge status="Auto-save" />
            </div>
            
            <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mb-6 bg-[#f8fafc] dark:bg-[#09090b] p-3 rounded-lg border border-[#e5e7eb] dark:border-[#27272a]">
              {t('subscription_defaults_note')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>{t('default_trial_days')}</label>
                <input
                  type="number"
                  min="0"
                  className={errors.defaultTrialDays ? customInputErrorClass : customInputClass}
                  value={form.defaultTrialDays}
                  onChange={(e) => handleChange({ defaultTrialDays: e.target.value }, 'subscription')}
                />
                {errors.defaultTrialDays && <p className="text-xs text-red-500 mt-1">{errors.defaultTrialDays}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('default_monthly_price')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={errors.defaultMonthlyPrice ? customInputErrorClass : customInputClass}
                  value={form.defaultMonthlyPrice}
                  onChange={(e) => handleChange({ defaultMonthlyPrice: e.target.value }, 'subscription')}
                />
                {errors.defaultMonthlyPrice && <p className="text-xs text-red-500 mt-1">{errors.defaultMonthlyPrice}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('currency')}</label>
                <select
                  className={customSelectClass}
                  value={form.currency}
                  onChange={(e) => handleChange({ currency: e.target.value }, 'subscription')}
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('grace_period_days')}</label>
                <input
                  type="number"
                  min="0"
                  className={errors.gracePeriodDays ? customInputErrorClass : customInputClass}
                  value={form.gracePeriodDays}
                  onChange={(e) => handleChange({ gracePeriodDays: e.target.value }, 'subscription')}
                />
                {errors.gracePeriodDays && <p className="text-xs text-red-500 mt-1">{errors.gracePeriodDays}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
              <SectionStatus status={status.subscription} />
            </div>
          </div>

          {/* Section 3: Backup / Maintenance */}
          <div className={`${cardClass} p-5 md:p-6`}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mt-0.5">
                  <FaDatabase className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('backup_maintenance')}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">{t('backup_maintenance_desc')}</p>
                </div>
              </div>
              <Badge status="Working" />
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  {loadingBackups ? t('loading_backup_info') : (backups.length > 0 ? `${t('latest_backup')} ${backups[0].name || backups[0].id || 'Success'}` : t('no_backups_found'))}
                </p>
              </div>
              <div>
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup || loadingBackups}
                  className={customPrimaryButton}
                >
                  {isCreatingBackup ? t('creating') : t('create_backup')}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">

          {/* Section 4: Notification Settings */}
          <div className={`${cardClass} p-5 md:p-6`}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 mt-0.5">
                  <FaBell className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('notifications_title')}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">{t('notifications_desc')}</p>
                </div>
              </div>
              <Badge status="Auto-save" />
            </div>
            
            <div className="space-y-6 mb-6">
              {[
                { id: "enableTelegramAlerts", label: t('telegram_alerts'), desc: t('telegram_alerts_desc') },
                { id: "enableLowStockAlerts", label: t('low_stock_alerts'), desc: t('low_stock_alerts_desc') },
                { id: "enableSubscriptionExpiryAlerts", label: t('subscription_expiry_alerts'), desc: t('subscription_expiry_alerts_desc') },
                { id: "enableAdminActivityAlerts", label: t('admin_activity_alerts'), desc: t('admin_activity_alerts_desc') },
              ].map(item => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div>
                    <label htmlFor={item.id} className="text-sm font-bold text-[#020617] dark:text-[#f8fafc] cursor-pointer block mb-1">
                      {item.label}
                    </label>
                    <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] leading-relaxed">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    id={item.id}
                    className="w-5 h-5 rounded border-[#e5e7eb] dark:border-[#27272a] text-[#06b6d4] focus:ring-[#06b6d4] mt-0.5 cursor-pointer"
                    checked={form[item.id]}
                    onChange={(e) => handleChange({ [item.id]: e.target.checked }, 'notifications')}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
              <SectionStatus status={status.notifications} />
            </div>
          </div>

          {/* Section 5: Security Settings */}
          <div className={`${cardClass} p-5 md:p-6`}>
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e5e7eb] dark:border-[#27272a]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 mt-0.5">
                  <FaShieldHalved className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('security_settings')}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">{t('security_settings_desc')}</p>
                </div>
              </div>
              <Badge status="Auto-save" />
            </div>
            
            <div className="space-y-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="requireStrongPassword" className="text-sm font-bold text-[#020617] dark:text-[#f8fafc] cursor-pointer block mb-1">
                    {t('require_strong_password')}
                  </label>
                </div>
                <input
                  type="checkbox"
                  id="requireStrongPassword"
                  className="w-5 h-5 rounded border-[#e5e7eb] dark:border-[#27272a] text-[#06b6d4] focus:ring-[#06b6d4] mt-0.5 cursor-pointer"
                  checked={form.requireStrongPassword}
                  onChange={(e) => handleChange({ requireStrongPassword: e.target.checked }, 'security')}
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="loginAlertToggle" className="text-sm font-bold text-[#020617] dark:text-[#f8fafc] cursor-pointer block mb-1">
                    {t('login_alert_toggle')}
                  </label>
                </div>
                <input
                  type="checkbox"
                  id="loginAlertToggle"
                  className="w-5 h-5 rounded border-[#e5e7eb] dark:border-[#27272a] text-[#06b6d4] focus:ring-[#06b6d4] mt-0.5 cursor-pointer"
                  checked={form.loginAlertToggle}
                  onChange={(e) => handleChange({ loginAlertToggle: e.target.checked }, 'security')}
                />
              </div>
              <div className="pt-2">
                <label className={labelClass}>{t('session_timeout')}</label>
                <input
                  type="number"
                  min="5"
                  className={errors.sessionTimeout ? customInputErrorClass : customInputClass}
                  value={form.sessionTimeout}
                  onChange={(e) => handleChange({ sessionTimeout: e.target.value }, 'security')}
                />
                {errors.sessionTimeout && <p className="text-xs text-red-500 mt-1">{errors.sessionTimeout}</p>}
                {!errors.sessionTimeout && <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-2">{t('session_timeout_desc')}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-[#e5e7eb] dark:border-[#27272a]">
              <SectionStatus status={status.security} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Settings
