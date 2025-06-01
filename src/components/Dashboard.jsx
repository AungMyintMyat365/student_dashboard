// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchSheetData } from "../utils/sheetsApi";
import { useAuth } from "../utils/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Dashboard() {
  const { logout } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [sessions, setSessions] = useState([]);
  const pdfRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const ach = await fetchSheetData("Achievement Done");
        const prog = await fetchSheetData("Points");
        const sess = await fetchSheetData("Student Data");

        setAchievements(ach);
        setProgress(prog);
        setSessions(sess);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
  }, []);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push("Achievements");
    wb.SheetNames.push("Progress");
    wb.SheetNames.push("Sessions");

    const achWS = XLSX.utils.json_to_sheet(achievements);
    const progWS = XLSX.utils.json_to_sheet(progress);
    const sessWS = XLSX.utils.json_to_sheet(sessions);

    wb.Sheets["Achievements"] = achWS;
    wb.Sheets["Progress"] = progWS;
    wb.Sheets["Sessions"] = sessWS;

    XLSX.writeFile(wb, "dashboard_export.xlsx");
  };

  const exportToPDF = () => {
    html2canvas(pdfRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("dashboard_export.pdf");
    });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen" ref={pdfRef}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress}>
              <XAxis dataKey="Name" hide={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Week 1" fill="#8884d8" />
              <Bar dataKey="Week 2" fill="#82ca9d" />
              <Bar dataKey="Week 3" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Achievements</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {achievements.map((item, idx) => (
              <li key={idx}>{item.Name}: {item.Achievement}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow md:col-span-2 overflow-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Student Sessions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  {sessions[0] && Object.keys(sessions[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1 border whitespace-nowrap">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
