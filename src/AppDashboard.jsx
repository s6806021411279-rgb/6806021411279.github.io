import React, { useEffect, useState } from "react";
import { LayoutDashboard, LineChart, Hexagon, Info, Menu, X, Cpu } from "lucide-react";
import { api } from "./api";
import Dashboard from "./pages/Dashboard.jsx";
import Training from "./pages/Training.jsx";
import Segmentation from "./pages/Segmentation.jsx";
import About from "./pages/About.jsx";
import BrowserPredict from "./pages/BrowserPredict.jsx";

const ALL_PAGES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, C: Dashboard },
  { id: "training", label: "Training Results", icon: LineChart, C: Training },
  { id: "segmentation", label: "Polygon Segmentation", icon: Hexagon, C: Segmentation },
  { id: "browser", label: "Browser Predict", icon: Cpu, C: BrowserPredict },
  { id: "about", label: "About Project", icon: Info, C: About },
];
// โหมดส่งงานบน GitHub Pages (ไม่มี Backend): npm run build:static
const STATIC = import.meta.env.VITE_STATIC === "true";
const PAGES = STATIC ? ALL_PAGES.filter((p) => ["browser", "about"].includes(p.id)) : ALL_PAGES;

export default function App() {
  const [page, setPage] = useState(location.hash.slice(1) || PAGES[0].id);
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(null);
  useEffect(() => { if (!STATIC) api.get("/api/health").then(() => setOnline(true)).catch(() => setOnline(false)); }, []);
  useEffect(() => { location.hash = page; }, [page]);
  const Current = (PAGES.find((p) => p.id === page) || PAGES[0]).C;

  const nav = (
    <nav className="space-y-1">
      {PAGES.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => { setPage(id); setOpen(false); }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${page === id ? "bg-peri-100 font-medium text-peri-600" : "text-ink-soft hover:bg-sky-100"}`}>
          <Icon size={18} /> {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-peri-100 bg-white/80 p-5 lg:block">
        <div className="mb-8 font-display text-lg font-semibold">YOLO <span className="text-lav-500">Vision</span></div>
        {nav}
        <div className="mt-8 flex items-center gap-2 text-xs text-ink-mute">
          <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400" : online === false ? "bg-red-400" : "bg-ink-mute"}`} />
          Backend {online ? "ออนไลน์" : online === false ? "ออฟไลน์" : "กำลังตรวจสอบ"}
        </div>
      </aside>
      <header className="flex items-center justify-between border-b border-peri-100 bg-white/80 px-4 py-3 lg:hidden">
        <span className="font-display font-semibold">YOLO Vision</span>
        <button aria-label="เมนู" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="border-b border-peri-100 bg-white p-4 lg:hidden">{nav}</div>}
      <main className="mx-auto w-full max-w-[1280px] p-4 sm:p-8"><Current go={setPage} /></main>
    </div>
  );
}
