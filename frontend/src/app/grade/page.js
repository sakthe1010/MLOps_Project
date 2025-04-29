"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export default function GradePage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [error, setError] = useState("");

  // Auth token check with delay buffer
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          alert("⚠️ Please login first to access Grade selection.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  const fetchGrades = async () => {
    setLoadingGrades(true);
    setError("");

    try {
      const res = await fetchWithTimeout(
        "http://10.42.0.1:8000/api/classes",
        {},
        5000
      );
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setGrades(data.classes.map((c) => `Class ${c}`));
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load classes. Please check your connection and try again.");
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (checkedAuth) {
      fetchGrades();
    }
  }, [checkedAuth]);

  const handleNext = () => {
    if (!selectedGrade) {
      alert("⚠️ Please select a grade before continuing.");
      return;
    }
    localStorage.setItem("selectedGrade", selectedGrade);
    router.push("/subject");
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  if (loadingGrades) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-300 to-orange-400 p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full border-white animate-spin"></div>
          <p className="text-xl font-semibold text-black mt-6">
            Fetching available classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-300 to-orange-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-black mb-8 animate-fade-down">
            Select Your Grade
          </h1>

          {error && (
            <div className="mb-4 text-center text-red-600 font-semibold">
              {error}
              <br />
              <button
                onClick={fetchGrades}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <select
                className="w-full p-3 mb-6 border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">-- Select Grade --</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNext}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
