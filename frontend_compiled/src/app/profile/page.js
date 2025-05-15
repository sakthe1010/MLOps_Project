"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ProfilePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const router = useRouter();

  useEffect(() => {
    if (!username) {
      alert("⚠️ Please login first.");
      router.push("/login");
      return;
    }

    fetch(`http://localhost:8000/api/user/reports?username=${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reports");
        return res.json();
      })
      .then((data) => setReports(data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load profile data.");
      })
      .finally(() => setLoading(false));
  }, [username, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-black">
        Loading your test history...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-200 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-black">📘 Your Test History</h1>

          {reports.length === 0 ? (
            <p className="text-black text-lg">No tests taken yet.</p>
          ) : (
            <ul className="space-y-4">
              {reports.map((report) => (
                <li
                  key={report.id}
                  onClick={() => router.push(`/profile/report/${report.id}`)}
                  className="cursor-pointer border p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <div className="text-black">
                    <p className="font-semibold text-lg">
                      {report.context_json.subject?.toUpperCase()} - {report.context_json.chapter}
                    </p>
                    <p className="text-sm">
                      Class {report.context_json.class_} | Mode:{" "}
                      <span className="font-medium">{report.mode}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Score: {report.score} / {report.total}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(report.date).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
