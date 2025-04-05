"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";

const grades = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export default function GradePage() {
  const [selectedGrade, setSelectedGrade] = useState("");
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
  }, []);

  const handleNext = () => {
    if (!selectedGrade) return alert("Please select a grade.");
    localStorage.setItem("selectedGrade", selectedGrade);
    router.push("/subject");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 to-orange-400">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Select Your Grade</h1>
        <select
          className="w-full p-3 border rounded mb-6 text-black"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value="">-- Select Grade --</option>
          {grades.map((grade, index) => (
            <option key={index} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="w-1/2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="w-1/2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
