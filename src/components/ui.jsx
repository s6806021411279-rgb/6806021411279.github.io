import React from "react";

export const Card = ({ title, icon: Icon, right, children, className = "" }) => (
  <section className={`rounded-2xl border border-peri-100 bg-white/90 p-5 shadow-soft ${className}`}>
    {(title || right) && (
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          {Icon && <Icon size={18} className="text-peri-500" />}
          {title}
        </h3>
        {right}
      </header>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value, hint, icon: Icon }) => (
  <div className="rounded-2xl border border-peri-100 bg-white/90 p-5 shadow-soft">
    <div className="flex items-center justify-between text-sm text-ink-soft">
      {label}
      {Icon && <Icon size={18} className="text-lav-500" />}
    </div>
    <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    {hint && <div className="mt-1 text-xs text-ink-mute">{hint}</div>}
  </div>
);

export const PageTitle = ({ title, desc }) => (
  <div className="mb-6">
    <h1 className="font-display text-2xl font-semibold">{title}</h1>
    {desc && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{desc}</p>}
  </div>
);

export const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-peri-100 bg-sky-50 p-6 text-center text-sm text-ink-soft">{children}</div>
);

export const Btn = ({ children, className = "", ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-peri-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-peri-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const fmt = (v, d = 3) => (v == null ? "–" : Number(v).toFixed(d));
export const COLORS = ["#5F76DA", "#9B82EA", "#7DB6F5", "#C9B8F7", "#4A5FC4", "#A9D2FF"];
