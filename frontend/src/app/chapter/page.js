"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ChapterPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const selectedGrade = localStorage.getItem("selectedGrade");
    const selectedSubject = localStorage.getItem("selectedSubject");

    if (!selectedGrade || !selectedSubject) {
      router.push("/subject");
      return;
    }

    setGrade(selectedGrade);
    setSubject(selectedSubject);

    const fetchChapters = async () => {
      try {
        const gradeNumber = selectedGrade.replace("Class ", "").trim();

        const res = await fetch(`http://127.0.0.1:8000/api/chapters?class=${gradeNumber}&subject=${selectedSubject}`);
        if (!res.ok) throw new Error("Failed to fetch chapters");

        const data = await res.json();

        const sortedChapters = (data.chapters || []).sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
          return numA - numB;
        });

        setChapters(sortedChapters);
      } catch (error) {
        console.error(error);
        setChapters([]);
      }
    };

    fetchChapters();
  }, [router]);

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
  };

  const startTestOrPractice = (mode) => {
    if (!selectedChapter) {
      alert("Please select a chapter.");
      return;
    }
    localStorage.setItem("selectedChapter", selectedChapter);
    localStorage.setItem("mode", mode);
    router.push("/configure");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">
            Select Chapter - {grade} {subject}
          </h1>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search chapters..."
              className="flex-1 p-2 border rounded text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {chapters.length > 0 ? (
              chapters
                .filter((chapter) =>
                  chapter.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`py-2 px-4 rounded border text-black text-left ${
                      selectedChapter === chapter
                        ? "bg-purple-600 text-white"
                        : "bg-white border-gray-300"
                    } transition hover:shadow-md`}
                  >
                    {chapter}
                  </button>
                ))
            ) : (
              <p className="text-center text-gray-600">No chapters available. Please check selection.</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => startTestOrPractice("test")}
              className="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
            >
              Take Test
            </button>
            <button
              onClick={() => startTestOrPractice("practice")}
              className="flex-1 bg-green-500 text-white py-3 rounded hover:bg-green-600"
            >
              Practice Mode
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
