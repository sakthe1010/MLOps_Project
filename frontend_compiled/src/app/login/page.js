"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      localStorage.setItem("token", data.access_token); // Save access token
      localStorage.setItem("username", email);          // Save username for test/report

      alert("Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 to-pink-400">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
        >
          Log In
        </button>

        <p className="mt-4 text-sm text-center text-black">
          New user?{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => router.push("/register")}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
