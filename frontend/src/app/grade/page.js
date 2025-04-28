"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setGrades(data.classes.map((c) => `Class ${c}`)); // UI expects "Class 6" format
      } catch (error) {
        console.error(error);
      }
    };
    fetchGrades();
  }, []);

  const handleNext = () => {
    if (!selectedGrade) return alert("Please select a grade.");
    localStorage.setItem("selectedGrade", selectedGrade);
    router.push("/subject");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-300 to-orange-400">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Select Your Grade</h1>
          <select
            className="w-full p-3 mb-6 border rounded text-black"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">-- Select Grade --</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
