"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export default function ChapterPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          alert("⚠️ Please login first to access Chapter selection.");
          router.replace("/login");
        } else {
          setCheckedAuth(true);
        }
      }, 300);
    } else {
      setCheckedAuth(true);
    }
  }, [router]);

  const fetchChapters = async () => {
    setLoadingChapters(true);
    setError("");

    try {
      const selectedGrade = localStorage.getItem("selectedGrade");
      const selectedSubject = localStorage.getItem("selectedSubject");

      if (!selectedGrade || !selectedSubject) {
        router.replace("/subject");
        return;
      }

      setGrade(selectedGrade);
      setSubject(selectedSubject);

      const gradeNumber = selectedGrade.replace("Class ", "").trim();
      const res = await fetchWithTimeout(
        `http://10.42.0.1:8000/api/chapters?class=${gradeNumber}&subject=${selectedSubject}`,
        {},
        5000
      );
      if (!res.ok) throw new Error("Failed to fetch chapters");

      const data = await res.json();

      const sortedChapters = (data.chapters || []).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });

      setChapters(sortedChapters);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load chapters. Please try again.");
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    if (checkedAuth) {
      fetchChapters();
    }
  }, [checkedAuth]);

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
  };

  const startTestOrPractice = (mode) => {
    if (!selectedChapter) {
      alert("⚠️ Please select a chapter before continuing.");
      return;
    }
    localStorage.setItem("selectedChapter", selectedChapter);
    localStorage.setItem("mode", mode);
    router.push("/configure");
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-black">
        Checking login...
      </div>
    );
  }

  if (loadingChapters) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full border-white animate-spin"></div>
          <p className="text-xl font-semibold text-black mt-6">
            Fetching available chapters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center text-black mb-8 animate-fade-down">
            Select Chapter - {grade} {subject}
          </h1>

          {error && (
            <div className="mb-4 text-center text-red-600 font-semibold">
              {error}
              <br />
              <button
                onClick={fetchChapters}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search chapters..."
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6 max-h-[400px] overflow-y-auto">
                {chapters.length > 0 ? (
                  chapters
                    .filter((chapter) =>
                      chapter.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((chapter, index) => (
                      <div
                        key={index}
                        onClick={() => handleChapterSelect(chapter)}
                        className={`cursor-pointer p-4 rounded-xl text-black border transition-all duration-300 hover:shadow-lg ${
                          selectedChapter === chapter
                            ? "bg-purple-600 text-white scale-105"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {chapter}
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-600">No chapters available. Please check your selection.</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => startTestOrPractice("test")}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Take Test
                </button>
                <button
                  onClick={() => startTestOrPractice("practice")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Practice Mode
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
