import { useEffect, useState } from "react"
import {
  cambodiaAddress,
  filterAddressOptions,
  getDisplayName,
} from "../../data/cambodiaAddress"

const levelLabels = {
  province: "Select province/state/area",
  district: "Select district/municipality/khan",
  commune: "Select commune/sangkat",
  village: "Select village",
}

const createEmptySelected = () => ({
  province: null,
  district: null,
  commune: null,
  village: null,
})

const isSameAddressItem = (item, value) => {
  if (!item || !value) return false
  if (item.code && value.code && String(item.code) === String(value.code)) return true
  return Boolean(
    (item.nameEn && value.nameEn && item.nameEn === value.nameEn)
    || (item.nameKm && value.nameKm && item.nameKm === value.nameKm)
  )
}

const hydrateSelectedAddress = (value) => {
  const nextSelected = createEmptySelected()

  nextSelected.province = cambodiaAddress.find((item) => (
    isSameAddressItem(item, value?.province)
  )) || value?.province || null

  nextSelected.district = nextSelected.province?.districts?.find((item) => (
    isSameAddressItem(item, value?.district)
  )) || value?.district || null

  nextSelected.commune = nextSelected.district?.communes?.find((item) => (
    isSameAddressItem(item, value?.commune)
  )) || value?.commune || null

  nextSelected.village = nextSelected.commune?.villages?.find((item) => (
    isSameAddressItem(item, value?.village)
  )) || value?.village || null

  return nextSelected
}

function ShopAddressPicker({ open, value, onClose, onChange }) {
  const [level, setLevel] = useState("province")
  const [selected, setSelected] = useState(createEmptySelected)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) return
    setLevel("province")
    setSelected(hydrateSelectedAddress(value))
    setSearch("")
  }, [open, value])

  const getCurrentItems = () => {
    if (level === "province") return cambodiaAddress
    if (level === "district") return selected.province?.districts || []
    if (level === "commune") return selected.district?.communes || []
    if (level === "village") return selected.commune?.villages || []
    return []
  }

  const items = filterAddressOptions(getCurrentItems(), search)

  const handleSelect = (item) => {
    if (level === "province") {
      setSelected({
        province: item,
        district: null,
        commune: null,
        village: null,
      })
      setLevel("district")
      setSearch("")
      return
    }

    if (level === "district") {
      setSelected((prev) => ({
        ...prev,
        district: item,
        commune: null,
        village: null,
      }))
      setLevel("commune")
      setSearch("")
      return
    }

    if (level === "commune") {
      setSelected((prev) => ({
        ...prev,
        commune: item,
        village: null,
      }))
      setLevel("village")
      setSearch("")
      return
    }

    if (level === "village") {
      const nextSelected = {
        ...selected,
        village: item,
      }

      setSelected(nextSelected)
      onChange(nextSelected)
      onClose()
    }
  }

  const handleBack = () => {
    setSearch("")

    if (level === "village") {
      setLevel("commune")
      return
    }

    if (level === "commune") {
      setLevel("district")
      return
    }

    if (level === "district") {
      setLevel("province")
    }
  }

  const getBreadcrumbItems = () => {
    const items = [
      {
        key: "country",
        label: "Cambodia",
        targetLevel: "province",
        disabled: level === "province",
      },
    ]

    if (selected.province && ["district", "commune", "village"].includes(level)) {
      items.push({
        key: "province",
        label: selected.province.nameEn,
        targetLevel: "district",
        disabled: level === "district",
      })
    }

    if (selected.district && ["commune", "village"].includes(level)) {
      items.push({
        key: "district",
        label: selected.district.nameEn,
        targetLevel: "commune",
        disabled: level === "commune",
      })
    }

    if (selected.commune && level === "village") {
      items.push({
        key: "commune",
        label: selected.commune.nameEn,
        targetLevel: "village",
        disabled: level === "village",
      })
    }

    return items
  }

  const handleBreadcrumbClick = (targetLevel) => {
    setSearch("")

    if (targetLevel === "province") {
      setLevel("province")
      return
    }

    if (targetLevel === "district" && selected.province) {
      setLevel("district")
      return
    }

    if (targetLevel === "commune" && selected.district) {
      setLevel("commune")
      return
    }

    if (targetLevel === "village" && selected.commune) {
      setLevel("village")
    }
  }

  if (!open) return null

  const selectedAtLevel = selected[level]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#020617] dark:text-[#f8fafc]">Select shop address</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {getBreadcrumbItems().map((item, index) => (
                <div key={item.key} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-300">›</span>}

                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(item.targetLevel)}
                    disabled={item.disabled}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      item.disabled
                        ? "cursor-default bg-[#7033ff] text-white shadow-sm"
                        : "bg-white text-[#7033ff] dark:bg-white/5 dark:text-[#f8fafc] hover:bg-slate-50 dark:hover:bg-white/10",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            className="rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] px-3 py-1.5 text-xs font-medium text-[#020617] dark:text-[#f8fafc] shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <label className="block space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{levelLabels[level]}</span>
              <input
                className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
              />
            </label>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selectedAtLevel?.code === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm shadow-sm transition-all ${
                    isSelected
                      ? "border-[#7033ff] bg-[#7033ff]/10 text-[#7033ff]"
                      : "border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] text-[#020617] dark:text-[#f8fafc] hover:border-[#7033ff] dark:hover:border-[#7033ff]"
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {getDisplayName(item, search)}
                </button>
              )
            })}
            {items.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-4 py-10 text-center text-sm text-[#64748b] dark:text-[#a1a1aa]">
                No address found
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[#e5e7eb] dark:border-[#27272a] pt-4">
            {level !== "province" ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
              >
                Back
              </button>
            ) : <span />}
            <button
              className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopAddressPicker
