// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchSheetData } from "../utils/sheetsApi";
import { useAuth } from "../utils/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { GraduationCap, Medal, Moon, Sun } from "lucide-react";

export default function Dashboard() {
  const { logout } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    wb.SheetNames.push("Achievements", "Progress", "Sessions");
    wb.Sheets["Achievements"] = XLSX.utils.json_to_sheet(achievements);
    wb.Sheets["Progress"] = XLSX.utils.json_to_sheet(progress);
    wb.Sheets["Sessions"] = XLSX.utils.json_to_sheet(sessions);
    XLSX.writeFile(wb, "dashboard_export.xlsx");
  };

  const exportToPDF = () => {
    html2canvas(pdfRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("dashboard_export.pdf");
    });
  };

  const filteredSessions = sessions.filter((row) =>
    Object.values(row).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const weekKeys = progress.length > 0
    ? Object.keys(progress[0]).filter(
        (key) => key.toLowerCase().includes("week")
      )
    : [];

  const weekColors = ["#4F46E5", "#3B82F6", "#60A5FA", "#818CF8", "#93C5FD", "#BFDBFE"];

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
      ref={pdfRef}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-blue-700 dark:text-white">
          <GraduationCap className="w-8 h-8" /> Student Dashboard
        </h1>
        <div className="flex gap-2 mt-4 md:mt-0 items-center">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Logout
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-2 rounded-full hover:opacity-80"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`border p-6 rounded-2xl shadow ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
            Weekly Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress}>
              <XAxis dataKey="Name" stroke={darkMode ? "#ccc" : "#000"} />
              <YAxis stroke={darkMode ? "#ccc" : "#000"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#333" : "#fff",
                  color: darkMode ? "#fff" : "#000",
                }}
              />
              <Legend />
              {weekKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={weekColors[index % weekColors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`border p-6 rounded-2xl shadow ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Medal className="w-5 h-5 text-blue-600 dark:text-blue-300" /> Achievements
          </h2>
          <div className="space-y-3">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-4 py-3 rounded-md text-sm shadow-sm ${
                  darkMode ? "bg-gray-700 text-white" : "bg-blue-50 text-gray-800"
                }`}
              >
                <span className="font-medium truncate max-w-[150px]">
                  {item.Name}
                </span>
                <span className="font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[150px] text-right">
                  {item.Achievement}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`border p-6 rounded-2xl shadow md:col-span-2 overflow-auto ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
            Student Sessions
          </h2>

          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-white">
                  {filteredSessions[0] &&
                    Object.keys(filteredSessions[0]).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 border text-left whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? (darkMode ? "bg-gray-700" : "bg-blue-50") : ""
                    }`}
                  >
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-3 py-2 border whitespace-nowrap">
                        {val}
                      </td>
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
