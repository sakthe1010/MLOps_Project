"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Example static chapter data (can be dynamic in future)
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
      "The Proposal",
      "Dust of Snow",
      "Fire and Ice",
      "A Tiger in the Zoo",
      "How to Tell Wild Animals",
      "The Ball Poem",
      "Amanda!",
      "Animals",
      "The Trees",
      "Fog",
      "The Tale of Custard the Dragon",
      "For Anne Gregory"
    ],
    Maths: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Applications of Trigonometry",
      "Circles",
      "Constructions",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability"
    ],
    Science: [
      "Chemical Reactions and Equations",
      "Acids, Bases, and Salts",
      "Metals and Non-Metals",
      "Carbon and Its Compounds",
      "Periodic Classification of Elements",
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce?",
      "Heredity and Evolution",
      "Light – Reflection and Refraction",
      "The Human Eye and the Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Sources of Energy",
      "Our Environment",
      "Sustainable Management of Natural Resources"
    ],
    "Social Science": [
      // History
      "The Rise of Nationalism in Europe",
      "Nationalism in India",
      "The Making of a Global World",
      "The Age of Industrialisation",
      "Print Culture and the Modern World",
      // Geography
      "Resources and Development",
      "Forest and Wildlife Resources",
      "Water Resources",
      "Agriculture",
      "Minerals and Energy Resources",
      "Manufacturing Industries",
      "Lifelines of National Economy",
      // Political Science
      "Power Sharing",
      "Federalism",
      "Gender, Religion, and Caste",
      "Political Parties",
      "Outcomes of Democracy",
      "Challenges to Democracy",
      // Economics
      "Development",
      "Sectors of the Indian Economy",
      "Money and Credit",
      "Globalisation and the Indian Economy",
      "Consumer Rights"
    ]
  };
  

export default function ChapterPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-xl font-bold mb-4 text-center text-black">
          Select Chapters for <span className="text-purple-600">{subject}</span>
        </h1>
        <button
          onClick={handleSelectAll}
          className="w-full mb-4 bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500"
        >
          {selectedChapters.length === chapters.length ? "Unselect All" : "Select All"}
        </button>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => toggleChapter(chapter)}
              className={`py-2 px-4 rounded border text-black text-left ${
                selectedChapters.includes(chapter)
                  ? "bg-purple-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              {chapter}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => router.push("/subject")}
            className="w-1/2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="w-1/2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
