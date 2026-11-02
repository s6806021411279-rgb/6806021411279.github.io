import React, { useEffect, useRef, useState } from "react";
import { loadSession, predict, draw, PALETTE } from "../lib/onnxYolo.js";

// ====== แก้ตรงนี้เพื่อปรับเว็บ ======
const TITLE = "Food Snap";
const HEADLINE = "วางรูปอาหาร แล้วให้ AI ทายให้!";
const SUBLINE = "ทายได้ 3 อย่าง: พิซซ่า แซนด์วิช และซูชิ";
const DEFAULT_NAMES = "Pizza, Sandwich, Sushi"; // เรียงตาม index ใน custom_seg.yaml
const EMOJI = ["🍕", "🥪", "🍣"];               // อีโมจิประจำคลาส (ลำดับเดียวกับชื่อ)
const MODEL_URL = `${import.meta.env.BASE_URL}models/seg.onnx`;
// ====================================

const btn = "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:translate-y-0.5";

export default function BrowserPredict() {
  const [session, setSession] = useState(null);
  const [model, setModel] = useState("loading"); // loading | ready | missing
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [conf, setConf] = useState(0.25);
  const [file, setFile] = useState(null);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const canvas = useRef();
  const input = useRef();

  // โหลดโมเดลครั้งเดียว
  useEffect(() => {
    loadSession(MODEL_URL).then((s) => { setSession(s); setModel("ready"); }).catch(() => setModel("missing"));
  }, []);

  // ทายอัตโนมัติเมื่อเลือกรูป / ปรับค่า
  useEffect(() => {
    if (!file || !session) return;
    let cancel = false;
    (async () => {
      setBusy(true); setErr("");
      try {
        const img = await new Promise((ok, bad) => {
          const i = new Image();
          i.onload = () => { URL.revokeObjectURL(i.src); ok(i); };
          i.onerror = bad;
          i.src = URL.createObjectURL(file);
        });
        const r = await predict(session, img, conf);
        if (cancel) return;
        const list = names.split(",").map((s) => s.trim());
        draw(canvas.current, img, r.dets, list, "polygon");
        setRes({ ...r, list, w: img.naturalWidth, h: img.naturalHeight });
      } catch (e) { if (!cancel) setErr("ทายไม่สำเร็จ: " + e.message); }
      finally { if (!cancel) setBusy(false); }
    })();
    return () => { cancel = true; };
  }, [file, session, conf, names]);

  // วางรูปด้วย Ctrl+V
  useEffect(() => {
    const onPaste = (e) => {
      const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/"));
      if (f) pick(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const pick = (f) => { if (f && f.type.startsWith("image/")) { setFile(f); setRes(null); } };

  const onModel = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { setSession(await loadSession(new Uint8Array(await f.arrayBuffer()))); setModel("ready"); }
    catch (x) { setErr("โหลดโมเดลไม่ได้: " + x.message); }
  };

  const save = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); };
  const savePng = () => canvas.current.toBlob((b) => save(b, "food-snap-result.png"));
  const saveJson = () => save(new Blob([JSON.stringify({
    image: { width: res.w, height: res.h },
    detections: res.dets.map((d) => ({ label: res.list[d.cls] ?? d.cls, confidence: +d.conf.toFixed(4), box: d.box, polygon: d.polygon })),
  }, null, 2)], { type: "application/json" }), "food-snap-result.json");

  const dets = res ? [...res.dets].sort((a, b) => b.conf - a.conf) : [];

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center justify-between">
        <div className="font-display text-xl font-semibold">🍽️ {TITLE}</div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${model === "ready" ? "bg-sun-200" : "bg-sun-100"}`}>
          {model === "ready" ? "● โมเดลพร้อมแล้ว" : model === "loading" ? "กำลังโหลดโมเดล…" : "ไม่พบโมเดล"}
        </span>
      </header>

      <section className="relative mt-8 text-center">
        <span aria-hidden className="animate-bob absolute -left-1 top-0 text-4xl sm:left-6 sm:text-5xl">🍕</span>
        <span aria-hidden className="animate-bob absolute -right-1 top-6 text-4xl sm:right-6 sm:text-5xl" style={{ animationDelay: "-1.3s" }}>🍣</span>
        <span aria-hidden className="animate-bob absolute left-6 top-24 hidden text-3xl sm:block" style={{ animationDelay: "-2.4s" }}>🥪</span>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{HEADLINE}</h1>
        <p className="mt-2 text-cocoa-soft">{SUBLINE}</p>
      </section>

      <main className="mt-8 rounded-[28px] border-2 border-sun-200 bg-white p-4 shadow-card sm:p-6">
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />

        {!file && (
          <button
            onClick={() => input.current.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
            className={`flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 transition ${over ? "scale-[1.01] border-sun-500 bg-sun-100" : "border-sun-300 bg-sun-50 hover:bg-sun-100"}`}
          >
            <span aria-hidden className="animate-bob text-6xl">📸</span>
            <span className="font-display text-xl font-semibold">ลากรูปมาวางตรงนี้</span>
            <span className="text-sm text-cocoa-soft">หรือกดเพื่อเลือกรูป · วางรูปด้วย Ctrl+V ก็ได้</span>
          </button>
        )}

        <div className={file ? "" : "hidden"}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-sun-200 bg-sun-50">
            <canvas ref={canvas} className="block w-full" />
            {(busy || (file && !res && !err)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 font-display text-lg font-semibold">
                <span className="animate-bob mr-2 text-3xl" aria-hidden>🔍</span> กำลังทาย…
              </div>
            )}
          </div>

          {res && (
            <div key={dets.length + "-" + res.ms} className="animate-pop mt-5">
              <h2 className="font-display text-xl font-semibold">
                {dets.length ? `เจอ ${dets.length} อย่างในรูป!` : "🤔 ไม่เจออาหารเลย"}
              </h2>
              {dets.length === 0 && <p className="mt-1 text-sm text-cocoa-soft">ลองลดค่า “ความมั่นใจขั้นต่ำ” ด้านล่าง หรือเปลี่ยนรูปใหม่</p>}
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {dets.map((d, i) => (
                  <li key={i} className="rounded-2xl bg-sun-50 p-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span><span aria-hidden>{EMOJI[d.cls] ?? "🍽️"}</span> {res.list[d.cls] ?? d.cls}</span>
                      <span style={{ color: PALETTE[d.cls % PALETTE.length] }}>{(d.conf * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-sun-100">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-sun-300 to-sun-500" style={{ width: `${d.conf * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-cocoa-mute">ใช้เวลาทาย {res.ms} ms · ประมวลผลในเครื่องคุณ ไม่ส่งรูปออกไปไหน</p>
            </div>
          )}
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => input.current.click()} className={`${btn} bg-sun-400 text-cocoa shadow-pop hover:bg-sun-300`}>📷 เลือกรูปใหม่</button>
            {res && <button onClick={savePng} className={`${btn} bg-sun-100 hover:bg-sun-200`}>⬇️ บันทึกรูปผลลัพธ์</button>}
            {res && <button onClick={saveJson} className={`${btn} bg-sun-100 hover:bg-sun-200`}>{"{ }"} บันทึก JSON</button>}
          </div>
        </div>

        {model === "missing" && (
          <p className="mt-4 rounded-2xl bg-sun-100 p-3 text-sm">ไม่พบไฟล์ <code>public/models/seg.onnx</code> — เลือกไฟล์ .onnx ในส่วน “ตั้งค่าเพิ่มเติม” ด้านล่างได้</p>
        )}

        <details className="mt-5 rounded-2xl border border-sun-200 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">⚙️ ตั้งค่าเพิ่มเติม</summary>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="flex justify-between text-cocoa-soft">ความมั่นใจขั้นต่ำ <b className="text-cocoa">{conf.toFixed(2)}</b></span>
              <input type="range" min="0.05" max="0.95" step="0.05" value={conf} onChange={(e) => setConf(+e.target.value)} className="w-full accent-sun-500" />
            </label>
            <label className="block">
              <span className="text-cocoa-soft">ชื่อคลาส (เรียงตาม index ของโมเดล)</span>
              <input value={names} onChange={(e) => setNames(e.target.value)} className="mt-1 w-full rounded-xl border border-sun-200 px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-cocoa-soft">ใช้ไฟล์โมเดล .onnx ของตัวเอง</span>
              <input type="file" accept=".onnx" onChange={onModel} className="mt-1 w-full text-xs" />
            </label>
          </div>
        </details>
      </main>

      <footer className="mt-8 text-center text-xs text-cocoa-mute">YOLO26n-seg · Polygon Segmentation · รันในเบราว์เซอร์ด้วย ONNX</footer>
    </div>
  );
}
