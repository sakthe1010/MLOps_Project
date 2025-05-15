"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export default function SubjectPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          alert("⚠️ Please login first to access Subject selection.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError("");

    try {
      const gradeFromStorage = localStorage.getItem("selectedGrade");

      if (!gradeFromStorage) {
        router.replace("/grade");
        return;
      }

      setGrade(gradeFromStorage);

      const gradeNumber = gradeFromStorage.replace("Class ", "").trim();
      const res = await fetchWithTimeout(
        `http://localhost:8000/api/subjects?class=${gradeNumber}`,
        {},
        5000
      );
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data.subjects);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load subjects. Please try again.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (checkedAuth) {
      fetchSubjects();
    }
  }, [checkedAuth]);

  const handleNext = () => {
    if (!selectedSubject) {
      alert("⚠️ Please select a subject before continuing.");
      return;
    }
    localStorage.setItem("selectedSubject", selectedSubject);
    router.push("/chapter");
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  if (loadingSubjects) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-400 p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full border-white animate-spin"></div>
          <p className="text-xl font-semibold text-black mt-6">
            Fetching available subjects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-400 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center text-black mb-8 animate-fade-down">
            Select Subject for {grade}
          </h1>

          {error && (
            <div className="mb-4 text-center text-red-600 font-semibold">
              {error}
              <br />
              <button
                onClick={fetchSubjects}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`cursor-pointer p-6 rounded-xl text-center font-semibold shadow-md transition-all duration-300 hover:shadow-xl ${
                      selectedSubject === subject
                        ? "bg-blue-600 text-white scale-105"
                        : "bg-white text-black"
                    }`}
                  >
                    {subject}
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
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
