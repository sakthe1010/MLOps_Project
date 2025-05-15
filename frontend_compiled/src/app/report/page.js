"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ReportPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          alert("⚠️ Please login first to view your Report.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  useEffect(() => {
    if (checkedAuth) {
      const reportData = JSON.parse(localStorage.getItem("lastReport") || "null");
      if (reportData) {
        setLastReport(reportData);
      }
    }
  }, [checkedAuth]);

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-black mb-8">Previous Report</h1>

          {lastReport ? (
            <>
              <p className="text-lg text-black mb-2">🗓️ Date: {lastReport.date}</p>
              <p className="text-lg text-black mb-2">🎯 Mode: {lastReport.mode}</p>
              <p className="text-lg text-black mb-2">📊 Total Questions: {lastReport.totalQuestions}</p>
              <p className="text-lg text-black mb-2">✅ Correct Answers: {lastReport.correctAnswers}</p>
              <p className="text-lg text-black mb-2">❌ Wrong Answers: {lastReport.wrongAnswers}</p>
              <p className="text-lg text-black mb-2">📈 Accuracy: {lastReport.accuracy}%</p>
            </>
          ) : (
            <p className="text-black text-lg mb-4">No previous report available.</p>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
