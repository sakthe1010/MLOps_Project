"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

const chapterData = {
  English: [
    "A Letter to God",
    "Nelson Mandela: Long Walk to Freedom",
    "Two Stories about Flying",
    "From the Diary of Anne Frank",
    "The Hundred Dresses – I",
    "The Hundred Dresses – II",
    "Glimpses of India",
    "Mijbil the Otter",
    "Madam Rides the Bus",
    "The Sermon at Benares",
  ],
  Maths: [
    "Real Numbers",
    "Polynomials",
    "Pair of Linear Equations in Two Variables",
    "Quadratic Equations",
    "Arithmetic Progressions",
  ],
  Science: [
    "Chemical Reactions and Equations",
    "Acids, Bases, and Salts",
    "Metals and Non-Metals",
    "Carbon and Its Compounds",
    "Periodic Classification of Elements",
  ],
  "Social Science": [
    "Nationalism in Europe",
    "Nationalism in India",
    "Making of a Global World",
    "Industrialisation",
    "Print Culture and Modern World",
  ],
};

export default function ChapterPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const selectedSubject = localStorage.getItem("selectedSubject");
    if (!selectedSubject) {
      router.push("/subject");
    } else {
      setSubject(selectedSubject);
      setChapters(chapterData[selectedSubject] || []);
    }
  }, [router]);

  const toggleChapter = (chapter) => {
    if (selectedChapters.includes(chapter)) {
      setSelectedChapters(selectedChapters.filter((ch) => ch !== chapter));
    } else {
      setSelectedChapters([...selectedChapters, chapter]);
    }
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters);
    }
  };

  const handleNext = () => {
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }
    localStorage.setItem("selectedChapters", JSON.stringify(selectedChapters));
    router.push("/test");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">
            Select Chapters - {subject}
          </h1>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="flex-1 bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500"
            >
              {selectedChapters.length === chapters.length ? "Unselect All" : "Select All"}
            </button>
            <input
              type="text"
              placeholder="Search chapters..."
              className="flex-1 p-2 border rounded text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {chapters
              .filter((chapter) =>
                chapter.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => toggleChapter(chapter)}
                  className={`py-2 px-4 rounded border text-black text-left ${
                    selectedChapters.includes(chapter)
                      ? "bg-purple-600 text-white"
                      : "bg-white border-gray-300"
                  } transition hover:shadow-md`}
                >
                  {chapter}
                </button>
              ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
