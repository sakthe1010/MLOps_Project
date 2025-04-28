"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

const subjectMap = {
  "Class 6": ["Maths", "Science"],
  "Class 7": ["Maths", "Science"],
  "Class 8": ["Maths", "Science"],
  "Class 9": ["Maths", "Science"],
  "Class 10": ["Maths", "Science"]
};

export default function SubjectPage() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const gradeFromStorage = localStorage.getItem("selectedGrade");
    if (!gradeFromStorage) router.push("/grade");
    setGrade(gradeFromStorage);
  }, [router]);

  const subjects = subjectMap[grade] || [];

  const handleNext = () => {
    if (!selectedSubject) return alert("Please select a subject.");
    localStorage.setItem("selectedSubject", selectedSubject);
    router.push("/chapter");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 to-blue-400 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-xl font-bold mb-6 text-center text-black">
            Select Subject for {grade}
          </h1>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {subjects.map((subject) => (
              <div
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`cursor-pointer p-6 rounded-lg shadow-md hover:shadow-xl transition ${
                  selectedSubject === subject
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                <h3 className="text-lg font-semibold text-center">{subject}</h3>
              </div>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
