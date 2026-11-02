import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Play, Download, Loader2, ImageIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api, url } from "../api";
import { Card, Btn, Empty, COLORS } from "./ui";

export function useModels(task) {
  const [models, setModels] = useState([]);
  const [err, setErr] = useState(null);
  useEffect(() => {
    api.get("/api/models").then((r) => setModels(task ? r.data.filter((m) => m.task === task) : r.data)).catch((e) => setErr(e.message));
  }, [task]);
  return { models, err };
}

export const pickDefault = (models) => (models.find((m) => m.kind === "best") || models[0])?.id || "";

export function UploadBox({ file, onFile }) {
  const ref = useRef();
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && onFile(e.dataTransfer.files[0]); }}
      className="flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-peri-100 bg-sky-50 transition hover:border-peri-400"
    >
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {preview ? (
        <img src={preview} alt="ภาพที่อัปโหลด" className="max-h-[420px] w-full object-contain" />
      ) : (
        <div className="p-6 text-center text-sm text-ink-soft">
          <Upload className="mx-auto mb-2 text-peri-500" />
          ลากรูปมาวาง หรือคลิกเพื่อเลือกรูปภาพ
        </div>
      )}
    </div>
  );
}

export function Settings({ conf, setConf, iou, setIou }) {
  const row = (label, v, set) => (
    <label className="block text-sm">
      <span className="flex justify-between text-ink-soft"><span>{label}</span><b className="text-ink">{v.toFixed(2)}</b></span>
      <input type="range" min="0.05" max="0.95" step="0.05" value={v} onChange={(e) => set(+e.target.value)} className="mt-1 w-full accent-peri-500" />
    </label>
  );
  return <div className="grid gap-4 sm:grid-cols-2">{row("Confidence threshold", conf, setConf)}{row("IoU threshold", iou, setIou)}</div>;
}

export async function runPredict(file, modelId, conf, iou) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("model_id", modelId);
  fd.append("conf", conf);
  fd.append("iou", iou);
  return (await api.post("/api/predict", fd)).data;
}

export function ResultView({ result }) {
  const bars = useMemo(() => {
    const m = {};
    result.detections.forEach((d) => (m[d.label] = (m[d.label] || 0) + 1));
    return Object.entries(m).map(([name, count]) => ({ name, count }));
  }, [result]);
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-peri-100 bg-sky-50">
        <img src={url(result.result_url)} alt="ผลการ Predict" className="max-h-[480px] w-full object-contain" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
        <span>พบ <b className="text-ink">{result.count}</b> วัตถุ · {result.inference_ms} ms · {result.image_size.width}×{result.image_size.height}px</span>
        <a href={url(result.download_url)} download>
          <Btn type="button"><Download size={16} /> ดาวน์โหลดภาพผลลัพธ์</Btn>
        </a>
      </div>
      {result.count === 0 ? (
        <Empty>ไม่พบวัตถุ ลองลดค่า Confidence threshold</Empty>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-peri-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-100 text-ink-soft">
                <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Label</th><th className="px-3 py-2">Confidence</th><th className="px-3 py-2">BBox (x1,y1,x2,y2)</th>{result.task === "segment" && <th className="px-3 py-2">Polygon</th>}</tr>
              </thead>
              <tbody>
                {result.detections.map((d, i) => (
                  <tr key={i} className="border-t border-peri-100">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{d.label}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-peri-100"><div className="h-2 rounded-full bg-peri-500" style={{ width: `${d.confidence * 100}%` }} /></div>
                        {(d.confidence * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-3 py-2 text-ink-soft">{d.bbox.join(", ")}</td>
                    {result.task === "segment" && <td className="px-3 py-2 text-ink-soft">{d.polygon?.length ?? 0} จุด</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={bars}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="count" name="จำนวน" radius={[6, 6, 0, 0]}>{bars.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

/** ใช้ร่วมกันทั้ง Object Detection (task="detect") และ Polygon Segmentation (task="segment") */
export default function PredictPanel({ task }) {
  const { models, err } = useModels(task);
  const [modelId, setModelId] = useState("");
  const [file, setFile] = useState(null);
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.7);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (models.length) setModelId(pickDefault(models)); }, [models]);

  const go = async () => {
    setBusy(true); setError(null);
    try { setResult(await runPredict(file, modelId, conf, iou)); }
    catch (e) { setError(e.response?.data?.detail || e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
      <Card title="ตั้งค่า" icon={ImageIcon}>
        <div className="space-y-4">
          <UploadBox file={file} onFile={(f) => { setFile(f); setResult(null); }} />
          <label className="block text-sm">
            <span className="text-ink-soft">โมเดล ({task === "segment" ? "Segmentation" : "Detection"})</span>
            <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="mt-1 w-full rounded-xl border border-peri-100 bg-white px-3 py-2.5">
              {models.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.size_mb} MB)</option>)}
            </select>
          </label>
          <Settings conf={conf} setConf={setConf} iou={iou} setIou={setIou} />
          <Btn className="w-full" disabled={!file || !modelId || busy} onClick={go}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} {busy ? "กำลังประมวลผล…" : "Predict"}
          </Btn>
          {err && <p className="text-sm text-red-500">เชื่อมต่อ Backend ไม่ได้: {err}</p>}
          {!err && !models.length && <Empty>ไม่พบไฟล์ Weight ของงานนี้ในโปรเจกต์</Empty>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </Card>
      <Card title="ผลลัพธ์">{result ? <ResultView result={result} /> : <Empty>อัปโหลดรูปแล้วกด Predict เพื่อดู {task === "segment" ? "Polygon Mask" : "Bounding Box"}</Empty>}</Card>
    </div>
  );
}
