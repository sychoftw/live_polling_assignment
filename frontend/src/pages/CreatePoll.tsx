import React, { useState } from "react";
import { socket } from "../utils/Socket";
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
  const navigate = useNavigate();

  // Handle case where socket might not be connected
  if (!socket) {
    alert("Socket not found. Please go back and rejoin.");
    // Optionally, navigate back or render a message
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-main text-white text-lg">
        Socket connection error. Please refresh or go back.
      </div>
    );
  }

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("60"); 

  const MAX_QUESTION_LENGTH = 100; 
  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleChangeOption = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleChangeDuration = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDuration(e.target.value);
    console.log("Selected duration:", e.target.value);
  };

  const handleSendPoll = () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }
    const cleanedOptions = options.map((opt) => opt.trim()).filter((opt) => opt !== "");
    if (cleanedOptions.length < 2) {
      alert("Please provide at least two valid options for the poll.");
      return;
    }
     navigate("/votepoll", { state: { role: "teacher" } });
     console.log("under nav")

    socket.emit("create_poll", {
      question,
      options: cleanedOptions,
      duration: parseInt(duration), // Ensure duration is a number
    });
   
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg-main p-5 font-inter">
      <div className="bg-dark-bg-card rounded-xl shadow-xl flex flex-col p-16 w-full max-w-4xl relative"> {/* Added relative for Ask Question button */}

        {/* Intervue Poll Tag */}
        <div className="bg-purple-primary text-white text-sm font-semibold py-2 px-4 rounded-full flex items-center gap-2 mb-8 self-center">
          <span className="text-base">⚡</span> Intervue Poll
        </div>

        {/* Main Title and Description */}
        <h1 className="text-4xl font-bold text-black text-center mb-4">
          Let's Get Started
        </h1>
        <p className="text-lg text-dark-text-secondary text-center mb-10 leading-relaxed max-w-lg self-center">
          you'll have the ability to create and manage polls, ask questions, and monitor
          your students' responses in real-time.
        </p>

        {/* Question Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <label htmlFor="question" className="block text-dark-text-secondary text-base">
              Enter your question
            </label>
            {/* Duration Dropdown */}
            <div className="relative">
              <select
                id="durationSelect"
                value={duration}
                onChange={handleChangeDuration}
                className="bg-gray text-black text-base rounded-md py-2 pl-4 pr-10
                           appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-primary"
                style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1em" // Adjust size as needed
                      }}
              >
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
                
              </select>
              {/* Custom arrow for select (if needed, otherwise appearance-none is enough with the background image) */}
            </div>
          </div>
          <textarea
            id="question"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_QUESTION_LENGTH}
            rows={4} // Adjust rows as needed for visual height
            className="w-full bg-card-bg-light text-black text-lg rounded-lg py-4 px-5
                       focus:outline-none focus:ring-2 focus:ring-purple-primary resize-none
                       placeholder-dark-text-secondary/60"
          ></textarea>
          <div className="text-right text-dark-text-secondary text-sm mt-1">
            {question.length}/{MAX_QUESTION_LENGTH}
          </div>
        </div>

        {/* Edit Options Section */}
        <div className="mb-16"> {/* Increased margin bottom for space before Add Question */}
          <h2 className="text-xl font-semibold text-white mb-6">Edit Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6"> {/* Grid for options */}
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-primary flex items-center justify-center text-white font-semibold">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleChangeOption(idx, e.target.value)}
                  className="flex-grow bg-card-bg-light text-black text-base rounded-lg py-3 px-4
                             focus:outline-none focus:ring-2 focus:ring-purple-primary
                             placeholder-dark-text-secondary/60"
                />
                {/* As per request, "Is It Correct?" section is omitted */}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddOption}
            className="mt-6 text-purple-primary border border-purple-primary px-5 py-2 rounded-full
                       text-base font-medium flex items-center gap-2 hover:bg-purple-primary hover:text-white
                       transition-colors duration-200 ease-in-out"
          >
            <span className="text-lg">+</span> Add More option
          </button>
        </div>

        {/* Ask Question Button (positioned absolutely at bottom right) */}
        <button
          onClick={handleSendPoll}
          className={`
            self-end py-4 px-10 rounded-full text-lg font-semibold text-white
            bg-gradient-to-r from-purple-primary to-purple-secondary
            transition-all duration-200 ease-in-out
            ${(!question.trim() || options.filter(opt => opt.trim() !== "").length < 2) // Disabled if question is empty or <2 valid options
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
            }
          `}
          disabled={!question.trim() || options.filter(opt => opt.trim() !== "").length < 2}
        >
          Ask Question
        </button>
      </div>
      
    </div>
  );
};

export default CreatePoll;