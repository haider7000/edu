import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const CurrentIcon = options.find((item) => item.value === theme)?.icon || Monitor;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose color theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] focus-visible:outline-none"
      >
        <CurrentIcon size={17} aria-hidden="true" />
        {!compact && <span className="hidden text-xs font-semibold sm:inline">{theme[0].toUpperCase() + theme.slice(1)}</span>}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close theme menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label="Theme options"
            className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-xl"
          >
            {options.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  theme === value
                    ? "bg-blue-600 text-white"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
