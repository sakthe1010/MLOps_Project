// src/app/api/admin/chapters/route.js
export async function GET() {
    // Dummy data - Replace with your real database query
    const chapters = [
      {
        class_: "10",
        subject: "english",
        chapter: "Chapter 1: A Letter to God",
        total_mcqs: 10,
        easy: 4,
        medium: 4,
        hard: 2
      },
      {
        class_: "10",
        subject: "maths",
        chapter: "Quadratic Equations",
        total_mcqs: 8,
        easy: 3,
        medium: 3,
        hard: 2
      }
      // etc.
    ];
  
    return Response.json(chapters);
  }
  