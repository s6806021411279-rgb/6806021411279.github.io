import React from "react";
import BrowserPredict from "./pages/BrowserPredict.jsx";

// เว็บหน้าเดียว: ลองทายรูป (ไม่ต้องใช้ Backend)
// ถ้าอยากกลับไปใช้ Dashboard เต็มรูปแบบ ให้เปลี่ยนเป็น: import App from "./AppDashboard.jsx"
export default function App() {
  return <BrowserPredict />;
}
