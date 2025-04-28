"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [lastReport, setLastReport] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const reportData = JSON.parse(localStorage.getItem("lastReport") || "null");
    if (reportData) {
      setLastReport(reportData);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-black mb-6">My Profile</h1>

          {lastReport ? (
            <>
              <p className="text-lg text-black mb-2">Last Mode Attempted: {lastReport.mode}</p>
              <p className="text-lg text-black mb-2">Accuracy: {lastReport.accuracy}%</p>
              <p className="text-lg text-black mb-2">Last Attempt: {lastReport.date}</p>
            </>
          ) : (
            <p className="text-black text-lg mb-4">No recent activity found.</p>
          )}

          {/* You can add more stats later like total tests attempted etc. */}

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white py-3 px-6 mt-6 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
