"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const subjectMap = {
  "Class 1": ["English", "Maths", "EVS"],
  "Class 2": ["English", "Maths", "EVS"],
  "Class 3": ["English", "Maths", "EVS"],
  "Class 4": ["English", "Maths", "EVS"],
  "Class 5": ["English", "Maths", "EVS"],
  "Class 6": ["English", "Maths", "Science", "Social Science"],
  "Class 7": ["English", "Maths", "Science", "Social Science"],
  "Class 8": ["English", "Maths", "Science", "Social Science"],
  "Class 9": ["English", "Maths", "Science", "Social Science"],
  "Class 10": ["English", "Maths", "Science", "Social Science"],
  "Class 11": ["Maths", "Physics", "Chemistry", "Biology", "Economics"],
  "Class 12": ["Maths", "Physics", "Chemistry", "Biology", "Economics"],
};

export default function SubjectPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const gradeFromStorage = localStorage.getItem("selectedGrade");
    if (!gradeFromStorage) {
      router.push("/grade");
    } else {
      setGrade(gradeFromStorage);
    }
  }, [router]);

  const subjects = subjectMap[grade] || [];

  const handleSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleNext = () => {
    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }
    localStorage.setItem("selectedSubject", selectedSubject);
    router.push("/chapter");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-blue-400">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-xl font-bold mb-6 text-center text-black">
          Select Subject for <span className="text-blue-600">{grade}</span>
        </h1>
        <div className="grid grid-cols-1 gap-3 mb-4">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => handleSelect(subject)}
              className={`py-2 px-4 rounded border text-black ${
                selectedSubject === subject
                  ? "bg-blue-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center gap-4 mt-4">
          <button
            onClick={() => router.push("/grade")}
            className="w-1/2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="w-1/2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
