"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function SubjectPage() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const gradeFromStorage = localStorage.getItem("selectedGrade");
    if (!gradeFromStorage) {
      router.push("/grade");
      return;
    }
    setGrade(gradeFromStorage);

    const fetchSubjects = async () => {
      try {
        const gradeNumber = gradeFromStorage.replace("Class ", "").trim(); 
        const res = await fetch(`http://127.0.0.1:8000/api/subjects?class=${gradeNumber}`);
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        setSubjects(data.subjects);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubjects();
  }, [router]);

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
