import { useEffect, useRef, useState } from "react";

/**
 * Searchable autocomplete combobox.
 *
 * Props:
 *   label           {string}            Field label shown above the input.
 *   value           {any}               Currently selected option object (or null/undefined).
 *   onChange        {(option) => void}  Called with the selected option object when user picks one.
 *   options         {any[]}             Full list of available options.
 *   getOptionLabel  {(opt) => string}   Returns the display string for an option.
 *   getOptionSearchText {(opt) => string} Returns the string used for searching/filtering.
 *   placeholder     {string}            Input placeholder shown when nothing is selected.
 *   disabled        {boolean}           Disables the combobox entirely.
 *   error           {string}            Validation error text shown below the input.
 *   emptyMessage    {string}            Message shown when no options match the query.
 */
export default function Combobox({
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (opt) => String(opt),
  getOptionSearchText = (opt) => String(opt),
  placeholder = "Search...",
  disabled = false,
  error,
  emptyMessage = "No results found",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Display text: selected option label OR the live query while typing
  const displayValue = value ? getOptionLabel(value) : "";

  // Filter options against the query
  const filtered =
    query.trim() === ""
      ? options
      : options.filter((opt) =>
          getOptionSearchText(opt)
            .toLowerCase()
            .includes(query.trim().toLowerCase())
        );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        // If user blurred without selecting, restore display value
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const item = listRef.current.children[activeIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  function handleInputChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleSelect(opt) {
    onChange(opt);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleInputFocus() {
    if (!disabled) {
      setOpen(true);
    }
  }

  function handleKeyDown(e) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
        break;
      case "Tab":
        setOpen(false);
        setQuery("");
        break;
      default:
        break;
    }
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  const inputDisplayValue = open ? query : displayValue;

  return (
    <div ref={containerRef} className="grid gap-1 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputDisplayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={[
            "w-full rounded-lg border px-3 py-2 pr-8 outline-none transition",
            error
              ? "border-rose-400 focus:border-rose-500"
              : "border-slate-300 focus:border-indigo-500",
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-white",
          ].join(" ")}
        />

        {/* Clear button — shown only when a value is selected */}
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}

        {/* Chevron icon when no value selected */}
        {!value && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        )}

        {/* Dropdown list */}
        {open && !disabled && (
          <ul
            ref={listRef}
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-slate-400 italic">{emptyMessage}</li>
            ) : (
              filtered.map((opt, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = value && getOptionLabel(opt) === getOptionLabel(value);
                return (
                  <li
                    key={getOptionSearchText(opt) + idx}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={[
                      "cursor-pointer px-3 py-2 transition",
                      isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50",
                      isSelected ? "font-semibold text-indigo-600" : "",
                    ].join(" ")}
                  >
                    {getOptionLabel(opt)}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
