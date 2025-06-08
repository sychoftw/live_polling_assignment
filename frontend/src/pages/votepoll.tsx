import React, { useEffect, useState } from "react";
import { socket } from "../utils/Socket";
import { useLocation, useNavigate } from "react-router-dom";
import CountdownTimer from "../components/Ticker"; 
import ChatPopover from "../components/ChatPopover";


interface Poll {
  question: string;
  options: string[];
  duration: number;
  createdAt?: Date; 
  votes?: number[];
}

const VotePoll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const isStudent = role === "student";
  const studentName = isStudent ? location.state?.name : null;

  const [poll, setPoll] = useState<null | {
    question: string;
    options: string[];
    votes: number[];
  }>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isClickable, setIsClickable] = useState(true); 
  const [timeLeft, setTimeLeft] = useState<number | null>(null); 

  // Function to navigate to Create Poll page for teachers
  function handleAskNewQuestion() {
    navigate("/createpoll");
  }

  // Function to navigate to Poll History (dummy for now)
  function handleViewPollHistory() {
    // Implement navigation to poll history page
    console.log("Navigating to poll history...");
    
  }

  useEffect(() => {
    
    socket.on("new_poll", ({ question, options, duration }: Poll) => {
      setPoll({ question, options, votes: Array(options.length).fill(0) }); 
      setHasVoted(false); 
      setSelected(null); 
      setIsClickable(false); 
      setTimeLeft(duration); 
      console.log("🟢 New poll received. Duration:", duration);
    });

    socket.on("poll_tick", ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft); 
    });
    console.log("inside the useeffect ------ ")

   
    socket.on("poll_results", (updatedPoll: React.SetStateAction<{ question: string; options: string[]; votes: number[]; } | null>) => {
      setPoll(updatedPoll);
      setIsClickable(true);
      setTimeLeft(null); 
    });

   
    return () => {
      socket.off("new_poll");
      socket.off("poll_tick");
      socket.off("poll_results");
    };
  }, [poll]); 

 
  const submitVote = () => {
  
    if (selected === null || !studentName) {
      alert("Please select an option to submit your vote."); 
      return;
    }
  
    socket.emit("submit_answer", { name: studentName, optionIndex: selected });
    setHasVoted(true); 
  };

  
  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-main text-black text-xl font-medium">
        <div className="bg-dark-bg-card rounded-xl p-10 shadow-lg">
          No active poll. Please wait for a teacher to create one.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg-main p-5 font-inter text-dark-text relative">

      
      <button
        onClick={handleViewPollHistory}
        className="absolute top-8 right-8 bg-purple-primary text-white text-sm font-semibold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-purple-secondary transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Poll history
      </button>

      
      <div className="bg-dark-bg-card rounded-xl shadow-xl p-16 w-full max-w-2xl mt-20 relative">
        
        {timeLeft !== null && (
          <div className="absolute top-4 right-4 text-dark-text text-lg font-semibold">
            <CountdownTimer duration={timeLeft} onEnd={() => console.log("Timer ended")} />
          </div>
        )}

        
        <h2 className="text-xl font-semibold mb-4">Question</h2>
        <div className="bg-card-bg-light rounded-lg p-5 mb-8 text-black text-lg break-words">
          {poll.question}
        </div>

       
        {!hasVoted && isStudent && timeLeft !== null && timeLeft > 0 ? (
         
          <div className="space-y-4">
            {poll.options.map((opt, idx) => (
              <label
                key={idx}
                className={`
                  flex items-center gap-4 bg-card-bg-light rounded-lg p-4 cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${selected === idx ? "border-2 border-purple-primary bg-purple-primary/20" : "hover:bg-gray-700"}
                `}
              >
               
                <div className={`
                  w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                  ${selected === idx ? "border-purple-primary bg-purple-primary" : "border-gray-500"}
                `}>
                  {selected === idx && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <input
                  type="radio"
                  name="vote"
                  className="hidden" 
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                  disabled={timeLeft === null || timeLeft <= 0} 
                />
                <span className="text-lg font-medium text-dark-text flex-grow">{opt}</span>
              </label>
            ))}
            <button
              onClick={submitVote}
              disabled={selected === null || timeLeft === null || timeLeft <= 0} 
              className={`
                mt-6 w-full py-3 rounded-lg text-xl font-semibold text-white
                bg-gradient-to-r from-purple-primary to-purple-secondary
                transition-all duration-200 ease-in-out
                ${(selected === null || timeLeft === null || timeLeft <= 0)
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
                }
              `}
            >
              Submit Vote
            </button>
          </div>
        ) : (
        
          <div className="space-y-6">
            {poll.options.map((opt, idx) => {
              const voteCount = poll.votes[idx];
              const total = poll.votes.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((voteCount / total) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-primary flex items-center justify-center text-white font-semibold">
                      {idx + 1}
                    </div>
                    
                    <span className="text-lg font-medium text-black flex-grow">{opt}</span>
                 
                    <span className="text-xl font-bold text-dark-text-secondary">{percentage}%</span>
                  </div>
                  
                  <div className="w-full bg-card-bg-light rounded-lg h-10">
                    <div
                      className="bg-purple-primary h-10 rounded-lg transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <span className="text-sm text-dark-text-secondary text-right">{voteCount} votes</span>
                </div>
              );
            })}
          </div>
        )}

      
        {!isStudent && (
          <button
            onClick={handleAskNewQuestion}
            disabled={!isClickable}
            className={`
              mt-12 py-4 px-10 rounded-full text-lg font-semibold text-white
              bg-gradient-to-r from-purple-primary to-purple-secondary
              transition-all duration-200 ease-in-out self-end
              ${!isClickable
                ? "opacity-60 cursor-not-allowed"
                : "hover:scale-105 active:scale-95"
              }
            `}
          >
            + Ask a new question
          </button>
        )}
      </div>

     
       <ChatPopover currentUserRole={role} currentUserName={studentName} />
    </div>
  );
};

export default VotePoll;