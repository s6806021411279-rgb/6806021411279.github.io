import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, Play } from "lucide-react";
import { Card, Btn, Empty, PageTitle } from "../components/ui.jsx";
import { useModels, pickDefault, UploadBox, Settings, runPredict, ResultView } from "../components/PredictPanel.jsx";

/** ส่งรูปเดียวเข้าทั้งโมเดล Detection และ Segmentation เพื่อเปรียบเทียบผลคู่กัน */
export default function AIPrediction() {
  const { models, err } = useModels();
  const det = models.filter((m) => m.task === "detect");
  const seg = models.filter((m) => m.task === "segment");
  const [dId, setD] = useState(""); const [sId, setS] = useState("");
  const [file, setFile] = useState(null);
  const [conf, setConf] = useState(0.25); const [iou, setIou] = useState(0.7);
  const [busy, setBusy] = useState(false); const [res, setRes] = useState({}); const [error, setError] = useState(null);

  useEffect(() => { setD(pickDefault(det)); setS(pickDefault(seg)); }, [models]); // eslint-disable-line

  const go = async () => {
    setBusy(true); setError(null); setRes({});
    try {
      const [a, b] = await Promise.all([dId && runPredict(file, dId, conf, iou), sId && runPredict(file, sId, conf, iou)]);
      setRes({ det: a || null, seg: b || null });
    } catch (e) { setError(e.response?.data?.detail || e.message); }
    finally { setBusy(false); }
  };

  const select = (label, list, v, set) => (
    <label className="block text-sm"><span className="text-ink-soft">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value)} className="mt-1 w-full rounded-xl border border-peri-100 bg-white px-3 py-2.5">
        {list.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    </label>
  );

  return (
    <>
      <PageTitle title="AI Prediction" desc="อัปโหลดรูปครั้งเดียว ระบบ Predict ด้วยทั้ง Rectangle และ Polygon เพื่อเทียบผลข้างกัน" />
      <Card title="อัปโหลดและเลือกโมเดล" icon={Sparkles}>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <UploadBox file={file} onFile={(f) => { setFile(f); setRes({}); }} />
          <div className="space-y-4">
            {select("โมเดล Detection (Rectangle)", det, dId, setD)}
            {select("โมเดล Segmentation (Polygon)", seg, sId, setS)}
            <Settings conf={conf} setConf={setConf} iou={iou} setIou={setIou} />
            <Btn className="w-full" disabled={!file || busy || (!dId && !sId)} onClick={go}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} {busy ? "กำลังประมวลผล…" : "Predict ทั้งสองโมเดล"}
            </Btn>
            {err && <p className="text-sm text-red-500">เชื่อมต่อ Backend ไม่ได้: {err}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </Card>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title="Rectangle · Bounding Box">{res.det ? <ResultView result={res.det} /> : <Empty>ยังไม่มีผลลัพธ์</Empty>}</Card>
        <Card title="Polygon · Mask">{res.seg ? <ResultView result={res.seg} /> : <Empty>ยังไม่มีผลลัพธ์</Empty>}</Card>
      </div>
    </>
  );
}
