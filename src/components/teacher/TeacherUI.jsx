import React from "react";
import {
  AlertCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";

/**
 * TeacherPage
 * Common page wrapper for all Teacher Portal pages.
 */
export function TeacherPage({
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

/**
 * Card
 */
export function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={[
        "rounded-2xl",
        "border border-slate-200",
        "bg-white",
        "shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * Button
 */
export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20",

    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500/20",

    danger:
      "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500/20",

    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/20",
  };

  const selectedVariant =
    variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex",
        "min-h-10",
        "items-center",
        "justify-center",
        "gap-2",
        "rounded-xl",
        "px-4",
        "py-2",
        "text-sm",
        "font-semibold",
        "transition",
        "duration-200",
        "outline-none",
        "focus:ring-4",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        selectedVariant,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Loading / Error / Empty state
 */
export function State({
  type = "loading",
  message,
}) {
  if (type === "loading") {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2
          size={18}
          className="animate-spin"
        />

        <span>
          {message || "Loading..."}
        </span>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        <AlertCircle
          size={19}
          className="shrink-0"
        />

        <span>
          {message ||
            "Something went wrong. Please try again."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
      {message || "No records found."}
    </div>
  );
}

/**
 * Search box
 */
export function SearchBox({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div
      className={[
        "relative",
        className,
      ].join(" ")}
    >
      <Search
        size={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => {
          if (typeof onChange === "function") {
            onChange(event.target.value);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-72"
      />
    </div>
  );
}

/**
 * Badge
 */
export function Badge({
  children,
  tone = "blue",
  className = "",
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };

  const selectedTone =
    tones[tone] || tones.slate;

  return (
    <span
      className={[
        "inline-flex",
        "rounded-full",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-semibold",
        selectedTone,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/**
 * Table
 */
export function Table({
  columns = [],
  rows = [],
  keyField = "id",
  empty = "No records found.",
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-5 py-3 font-semibold"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr
                key={
                  row?.[keyField] ??
                  `row-${index}`
                }
                className="transition hover:bg-slate-50/70"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-5 py-4 text-slate-700"
                  >
                    {typeof column.render === "function"
                      ? column.render(row)
                      : row?.[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={Math.max(columns.length, 1)}
                className="p-0"
              >
                <State
                  type="empty"
                  message={empty}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Modal
 */
export function Modal({
  open = false,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}) {
  if (!open) {
    return null;
  }

  const closeModal = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        className={[
          "max-h-[90vh]",
          "w-full",
          maxWidth,
          "overflow-auto",
          "rounded-2xl",
          "bg-white",
          "p-5",
          "shadow-2xl",
        ].join(" ")}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/**
 * Date formatter
 */
export function fmtDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

/**
 * Time formatter
 */
export function fmtTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);
}