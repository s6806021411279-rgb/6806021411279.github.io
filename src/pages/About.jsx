import React from "react";
import { Card, PageTitle } from "../components/ui.jsx";

const stack = [
  ["Frontend", "React.js + Vite (JavaScript / JSX)"],
  ["Styling", "Tailwind CSS"],
  ["Icons / Charts", "Lucide React / Recharts"],
  ["HTTP Client", "Axios"],
  ["Backend", "Python FastAPI"],
  ["AI Model", "Ultralytics YOLO (Detection + Segmentation)"],
  ["Image Processing", "OpenCV (อ่านรูป และวาด Box / Mask)"],
];

export default function About() {
  return (
    <>
      <PageTitle title="About Project" desc="Assignment train YOLO: เทรน Object Detection (Rectangle) และ Segmentation (Polygon) จากภาพของตัวเอง แล้วนำ Weight มาใช้งานผ่านเว็บแอป" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="เทคโนโลยี">
          <dl className="space-y-2 text-sm">{stack.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-peri-100 py-2"><dt className="text-ink-soft">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
        </Card>
        <Card title="ขั้นตอนการทำงาน">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
            <li>เตรียมภาพและ Label แบบ Rectangle และ Polygon (≥ 100 Object ต่อ Label)</li>
            <li>เทรนใน Notebook (yolo1tr / yolo2tr) ได้ผลใน runs/ และไฟล์ best.pt</li>
            <li>Backend FastAPI โหลด Weight จริงด้วย Ultralytics และอ่าน results.csv</li>
            <li>Frontend อัปโหลดรูป → API /api/predict → แสดง Box / Mask, Confidence และให้ดาวน์โหลดภาพ</li>
          </ol>
        </Card>
      </div>
    </>
  );
}
