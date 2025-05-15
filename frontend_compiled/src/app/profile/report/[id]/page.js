"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../components/navbar";

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/api/user/reports/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch report");
        return res.json();
      })
      .then((data) => setReport(data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load report.");
        router.push("/profile");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-black">
        Loading report details...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Report not found.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-6">
        <div className="max-w-3xl mx-auto bg-white text-black p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4">
            📊 Report Summary – {report.context_json.subject?.toUpperCase()} -{" "}
            {report.context_json.chapter}
          </h1>
          <p className="mb-1">Class: {report.context_json.class_}</p>
          <p className="mb-1">Mode: {report.mode}</p>
          <p className="mb-1">
            Score: {report.score} / {report.total}
          </p>
          <p className="mb-4">
            Date: {new Date(report.date).toLocaleString()}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">❌ Wrong Questions</h2>

          {report.wrong_questions.length === 0 ? (
            <p className="text-gray-700">🎉 No wrong answers in this test!</p>
          ) : (
            <ul className="space-y-4">
              {report.wrong_questions.map((wq, index) => (
                <li
                  key={index}
                  className="border border-gray-300 bg-gray-100 rounded-lg p-4"
                >
                  <p className="font-medium text-black mb-2">{wq.question}</p>
                  <p className="text-red-600">Your Answer: {wq.selected}</p>
                  <p className="text-green-600">Correct Answer: {wq.correct}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
