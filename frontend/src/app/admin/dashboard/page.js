"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [chapterData, setChapterData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, []);

  useEffect(() => {
    if (authorized === false) {
      alert("⚠️ Unauthorized access! Please login as admin.");
      router.replace("/admin/login");
    } else if (authorized === true) {
      fetchChapters();
      fetchPipelineRuns();
    }
  }, [authorized, router]);

  const fetchChapters = async () => {
    try {
      const res = await fetch("/api/admin/chapters");
      const data = await res.json();
      setChapterData(data);
    } catch (error) {
      console.error("Failed to fetch chapters", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineRuns = async () => {
    try {
      const res = await fetch("/api/pipeline/runs");
      const data = await res.json();
      setPipelineData(data);
    } catch (error) {
      console.error("Failed to fetch pipeline runs", error);
    }
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking Admin Access...
      </div>
    );
  }

  if (authorized === false) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-gray-300 p-6">
        <div className="w-16 h-16 border-4 border-dashed border-gray-600 rounded-full animate-spin"></div>
        <p className="text-black mt-4 text-lg font-semibold">Loading Admin Data...</p>
      </div>
    );
  }

  // Compute useful metrics
  const chaptersPerClass = chapterData.reduce((acc, ch) => {
    acc[ch.class_] = (acc[ch.class_] || 0) + 1;
    return acc;
  }, {});

  const mcqsPerSubject = chapterData.reduce((acc, ch) => {
    acc[ch.subject] = (acc[ch.subject] || 0) + (ch.total_mcqs || 0);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-200 to-indigo-200 p-6">
        <h1 className="text-3xl font-bold text-black mb-2">📊 Admin Dashboard</h1>
        <p className="text-sm text-black mb-6">
          Last Refreshed: {new Date().toLocaleString()}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black">Total Chapters per Class</h3>
            <ul className="list-disc list-inside text-black text-sm">
              {Object.entries(chaptersPerClass).map(([cls, count]) => (
                <li key={cls}>Class {cls}: {count} chapters</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black">Total MCQs per Subject</h3>
            <ul className="list-disc list-inside text-black text-sm">
              {Object.entries(mcqsPerSubject).map(([subject, total]) => (
                <li key={subject}>{subject}: {total} MCQs</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ✅ ML Pipeline Runs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-black">🧠 ML Pipeline Activity (Airflow)</h3>
          {pipelineData.length === 0 ? (
            <p className="text-black">No pipeline runs found.</p>
          ) : (
            <table className="w-full border border-gray-300 text-sm text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Pipeline</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Run Time</th>
                  <th className="p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {pipelineData.map((p, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="p-2">{p.dag_id}</td>
                    <td className={`p-2 font-bold ${p.status === "success" ? "text-green-600" : "text-red-500"}`}>{p.status}</td>
                    <td className="p-2">{new Date(p.run_time).toLocaleString()}</td>
                    <td className="p-2">{p.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
