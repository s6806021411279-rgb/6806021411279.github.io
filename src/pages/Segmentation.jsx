import React from "react";
import PredictPanel from "../components/PredictPanel.jsx";
import { PageTitle } from "../components/ui.jsx";

export default function Segmentation() {
  return (
    <>
      <PageTitle title="Polygon Segmentation" desc="อัปโหลดรูป เลือกโมเดลแบบ Polygon แล้วดู Mask พร้อมค่า Confidence และจำนวนจุดของ Polygon" />
      <PredictPanel task="segment" />
    </>
  );
}
