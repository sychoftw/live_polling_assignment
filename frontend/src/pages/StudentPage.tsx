import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/Socket"; // Assuming this path is correct

function StudentPage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const connectAsStudent = () => {
    if (!name.trim()) { // Use trim to prevent just spaces
      alert("Please enter your name to continue.");
      return;
    }

    socket.emit("register_student", name);
    navigate("/votepoll", { state: { name, role: "student" } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg-main p-5 font-inter">
      <div className="bg-dark-bg-card rounded-xl shadow-xl flex flex-col items-center p-16 w-full max-w-2xl">
        {/* Intervue Poll Tag */}
        <div className="bg-purple-primary text-white text-sm font-semibold py-2 px-4 rounded-full flex items-center gap-2 mb-8">
          <span className="text-base">⚡</span> Intervue Poll
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          Let's Get Started
        </h1>

        {/* Description */}
        <p className="text-lg text-dark-text-secondary text-center mb-10 leading-relaxed max-w-lg">
          If you're a student, you'll be able to{" "}
          <span className="font-bold text-black">submit your answers</span>, participate in live
          polls, and see how your responses compare with your classmates
        </p>

        {/* Name Input Section */}
        <div className="w-full max-w-sm mb-12">
          <label htmlFor="studentName" className="block text-dark-text-secondary text-base mb-3">
            Enter your Name
          </label>
          <input
            id="studentName"
            type="text"
            placeholder="Rahul Bajaj" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-card-bg-light text-black text-lg rounded-lg py-4 px-5
                       focus:outline-none focus:ring-2 focus:ring-purple-primary
                       placeholder-dark-text-secondary/60"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={connectAsStudent}
          className={`
            py-4 px-10 rounded-full text-lg font-semibold text-white
            bg-gradient-to-r from-purple-primary to-purple-secondary
            transition-all duration-200 ease-in-out
            ${!name.trim() // Disabled if name is empty or just spaces
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
            }
          `}
          disabled={!name.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default StudentPage;