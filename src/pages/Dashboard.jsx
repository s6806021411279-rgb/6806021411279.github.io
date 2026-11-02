import React, { useEffect, useState } from "react";
import { Boxes, Layers, Target, Hexagon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../api";
import { Card, Stat, PageTitle, Empty, fmt, COLORS } from "../components/ui.jsx";

const best = (runs, task, re) => {
  const vals = runs.filter((r) => r.task === task).map((r) => { const k = Object.keys(r.last).find((k) => re.test(k)); return k ? r.last[k] : null; }).filter((v) => v != null);
  return vals.length ? Math.max(...vals) : null;
};

export default function Dashboard({ go }) {
  const [d, setD] = useState({ models: [], runs: [], ds: [] });
  const [err, setErr] = useState(null);
  useEffect(() => {
    // โหลดแยกกัน: ถ้าอันไหนล้มเหลว จะบอกชื่อ endpoint ให้เห็น
    const get = (u, k) => api.get(u).then((r) => setD((o) => ({ ...o, [k]: r.data })))
      .catch((e) => setErr((p) => (p ? p + " · " : "") + `${u} → ${e.response?.status || e.message}`));
    get("/api/models", "models"); get("/api/runs", "runs"); get("/api/dataset", "ds");
  }, []);

  return (
    <>
      <PageTitle title="Dashboard" desc="ภาพรวมโปรเจกต์ YOLO: โมเดล ผลเทรน และข้อมูลที่ใช้" />
      {err && <Empty>เชื่อมต่อ Backend ไม่ได้ ({err}) — ตรวจสอบว่ารัน uvicorn ที่พอร์ต 8000 แล้ว</Empty>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Boxes} label="ไฟล์ Weight" value={d.models.length} hint="pretrained + best/last จาก runs" />
        <Stat icon={Layers} label="Training runs" value={d.runs.length} hint="อ่านจาก runs/**/results.csv" />
        <Stat icon={Target} label="mAP50 สูงสุด (Detect)" value={fmt(best(d.runs, "detect", /^metrics_mAP50_B$/))} />
        <Stat icon={Hexagon} label="mAP50 สูงสุด (Segment, Mask)" value={fmt(best(d.runs, "segment", /^metrics_mAP50_M$/))} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {d.ds.length === 0 && !err && <Empty>ไม่พบ custom_*.yaml หรือ dataset — ตั้งค่า YOLO_PROJECT_DIR / YOLO_DATASET_DIR</Empty>}
        {d.ds.map((s) => {
          const classes = s.names;
          const rows = classes.map((n) => ({ name: n, ...Object.fromEntries(Object.entries(s.splits).map(([sp, v]) => [sp, v.objects[n] || 0])) }));
          return (
            <Card key={s.file} title={`จำนวน Object ต่อ Label · ${s.file}`}>
              <p className="mb-3 text-sm text-ink-soft">{Object.entries(s.splits).map(([k, v]) => `${k}: ${v.images} รูป`).join(" · ") || "ไม่พบโฟลเดอร์รูปของ dataset"}</p>
              <div className="h-64"><ResponsiveContainer><BarChart data={rows}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis width={36} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                {Object.keys(s.splits).map((sp, i) => <Bar key={sp} dataKey={sp} fill={COLORS[i]} radius={[6, 6, 0, 0]} />)}
              </BarChart></ResponsiveContainer></div>
            </Card>
          );
        })}
      </div>

      <Card title="Training runs" className="mt-5" right={<button onClick={() => go("training")} className="text-sm text-peri-500 hover:underline">ดูรายละเอียด</button>}>
        {d.runs.length === 0 ? <Empty>ยังไม่พบ results.csv ใน runs/</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="text-ink-soft"><tr><th className="py-2">Run</th><th>Task</th><th>Epochs</th><th>Precision</th><th>Recall</th><th>mAP50</th><th>mAP50-95</th></tr></thead>
            <tbody>{d.runs.map((r) => {
              const g = (re) => { const k = Object.keys(r.last).find((k) => re.test(k)); return k ? r.last[k] : null; };
              const suf = r.task === "segment" ? "M" : "B";
              return <tr key={r.id} className="border-t border-peri-100">
                <td className="py-2 font-medium">{r.id}</td><td>{r.task}</td><td>{r.epochs}{r.epochs_planned ? `/${r.epochs_planned}` : ""}</td>
                <td>{fmt(g(new RegExp(`^metrics_precision_${suf}$`)))}</td><td>{fmt(g(new RegExp(`^metrics_recall_${suf}$`)))}</td>
                <td>{fmt(g(new RegExp(`^metrics_mAP50_${suf}$`)))}</td><td>{fmt(g(new RegExp(`^metrics_mAP50_95_${suf}$`)))}</td></tr>;
            })}</tbody></table></div>
        )}
      </Card>
    </>
  );
}
