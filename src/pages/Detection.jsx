import React from "react";
import PredictPanel from "../components/PredictPanel.jsx";
import { PageTitle } from "../components/ui.jsx";

export default function Detection() {
  return (
    <>
      <PageTitle title="Object Detection" desc="อัปโหลดรูป เลือกโมเดลแบบ Rectangle (Bounding Box) แล้วดูผลพร้อมค่า Confidence" />
      <PredictPanel task="detect" />
    </>
  );
}
