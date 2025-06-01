// src/utils/sheetsApi.js

export const fetchSheetData = async (sheetName) => {
  const API_KEY = "AIzaSyDGzoUsDdlBCtc9CTSTHA_weMliypsikb8";
  const SHEET_ID = "1lov-aHx2Sag7H_F4W3v4SO-mkj9Op91fOaDRQeJ_2nA";

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    sheetName
  )}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length === 0) return [];

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx] || "";
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
};
