import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import { api, url } from "../api";
import { Card, Stat, PageTitle, Empty, fmt, COLORS } from "../components/ui.jsx";

const Chart = ({ title, data, cols }) => (
  <Card title={title}>
    <div className="h-72"><ResponsiveContainer><LineChart data={data}>
      <CartesianGrid stroke="#E4E8FB" strokeDasharray="3 3" /><XAxis dataKey="epoch" tick={{ fontSize: 12 }} /><YAxis width={44} tick={{ fontSize: 12 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
      {cols.map((c, i) => <Line key={c.key} type="monotone" dataKey={c.key} name={c.label} dot={false} strokeWidth={2} stroke={COLORS[i % COLORS.length]} />)}
    </LineChart></ResponsiveContainer></div>
  </Card>
);

export default function Training() {
  const [runs, setRuns] = useState([]);
  const [id, setId] = useState("");
  const [det, setDet] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => { api.get("/api/runs").then((r) => { setRuns(r.data); if (r.data[0]) setId(r.data[0].id); }).catch((e) => setErr(e.message)); }, []);
  useEffect(() => { if (id) api.get("/api/runs/detail", { params: { id } }).then((r) => setDet(r.data)); }, [id]);

  const last = det?.series?.[det.series.length - 1] || {};
  const cols = det?.columns || [];
  const metricCols = cols.filter((c) => /^metrics\//.test(c.label));
  const lossCols = cols.filter((c) => /loss/.test(c.label));
  const seg = det?.args?.task === "segment";
  const suf = seg ? "M" : "B";

  return (
    <>
      <PageTitle title="Training Results" desc="ผลการเทรนจริงจากโฟลเดอร์ runs ของโปรเจกต์" />
      {err && <Empty>เชื่อมต่อ Backend ไม่ได้: {err}</Empty>}
      {!err && runs.length === 0 && <Empty>ไม่พบ runs/**/results.csv</Empty>}
      {runs.length > 0 && (
        <label className="mb-5 block max-w-md text-sm"><span className="text-ink-soft">เลือก Run</span>
          <select value={id} onChange={(e) => setId(e.target.value)} className="mt-1 w-full rounded-xl border border-peri-100 bg-white px-3 py-2.5">
            {runs.map((r) => <option key={r.id} value={r.id}>{r.id} ({r.task})</option>)}
          </select></label>
      )}
      {det && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Precision" value={fmt(last[`metrics_precision_${suf}`])} />
            <Stat label="Recall" value={fmt(last[`metrics_recall_${suf}`])} />
            <Stat label="mAP50" value={fmt(last[`metrics_mAP50_${suf}`])} hint={`Epoch ${last.epoch ?? "–"}`} />
            <Stat label="mAP50-95" value={fmt(last[`metrics_mAP50_95_${suf}`])} hint={seg ? "Mask" : "Box"} />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Chart title="Loss" data={det.series} cols={lossCols} />
            <Chart title="Metrics" data={det.series} cols={metricCols} />
          </div>
          <Card title="Hyperparameters" className="mt-5">
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(det.args).map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-peri-100 py-1"><dt className="text-ink-soft">{k}</dt><dd className="truncate font-medium">{String(v)}</dd></div>)}
            </dl>
          </Card>
          <Card title="ภาพจากการเทรน (Confusion matrix, PR curve, ตัวอย่าง Validation)" className="mt-5">
            {det.images.length === 0 ? <Empty>ไม่พบไฟล์ภาพผลเทรนใน run นี้</Empty> : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {det.images.map((im) => (
                  <button key={im.name} onClick={() => setZoom(im)} className="overflow-hidden rounded-xl border border-peri-100 bg-sky-50 text-left transition hover:border-peri-400">
                    <img src={url(im.url)} alt={im.name} loading="lazy" className="h-48 w-full object-contain" />
                    <div className="px-3 py-2 text-xs text-ink-soft">{im.name}</div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setZoom(null)}>
          <button aria-label="ปิด" className="absolute right-5 top-5 rounded-full bg-white p-2"><X size={18} /></button>
          <img src={url(zoom.url)} alt={zoom.name} className="max-h-full max-w-full rounded-2xl bg-white" />
        </div>
      )}
    </>
  );
}
