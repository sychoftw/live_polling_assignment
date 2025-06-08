import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/Socket"; // Assuming this path is correct

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(""); // 'student' or 'teacher'

  const handleContinue = () => {
    if (selectedRole === "student") {
      navigate("/student");
    } else if (selectedRole === "teacher") {
      socket.emit("register_teacher");
      navigate("/createpoll");
      console.log("under redirect");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg-main p-5 font-inter">
      <div className="bg-dark-bg-card rounded-xl shadow-xl flex flex-col items-center p-16 w-full max-w-3xl">
        {/* Intervue Poll Tag */}
        <div className="bg-purple-primary text-white text-sm font-semibold py-2 px-4 rounded-full flex items-center gap-2 mb-8">
          <span className="text-base">⚡</span> Intervue Poll
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-black text-center mb-4">
          Welcome to the Live Polling System
        </h1>

        {/* Description */}
        <p className="text-lg text-dark-text-secondary text-center mb-10 leading-relaxed max-w-md">
          Please select the role that best describes you to begin using the live polling system
        </p>

        {/* Role Cards Container */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 w-full justify-center">
          {/* Student Card */}
          <div
            className={`
              bg-card-bg-light rounded-lg p-8 flex-1 min-w-[280px] cursor-pointer
              border-2 transition-all duration-200 ease-in-out
              ${selectedRole === "student"
                ? "border-purple-primary bg-purple-primary/10"
                : "border-transparent hover:border-gray-600"
              }
            `}
            onClick={() => setSelectedRole("student")}
          >
            <h3 className="text-xl font-semibold text-black mb-2">I'm a Student</h3>
            <p className="text-base text-dark-text-secondary leading-snug">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          {/* Teacher Card */}
          <div
            className={`
              bg-card-bg-light rounded-lg p-8 flex-1 min-w-[280px] cursor-pointer
              border-2 transition-all duration-200 ease-in-out
              ${selectedRole === "teacher"
                ? "border-purple-primary bg-purple-primary/10"
                : "border-transparent hover:border-gray-600"
              }
            `}
            onClick={() => setSelectedRole("teacher")}
          >
            <h3 className="text-xl font-semibold text-black mb-2">I'm a Teacher</h3>
            <p className="text-base text-dark-text-secondary leading-snug">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          className={`
            py-4 px-10 rounded-full text-lg font-semibold text-white
            bg-gradient-to-r from-purple-primary to-purple-secondary
            transition-all duration-200 ease-in-out
            ${selectedRole === null
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
            }
          `}
          onClick={handleContinue}
          disabled={selectedRole === null}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;