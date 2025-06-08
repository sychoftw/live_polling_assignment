import React, { useState, useEffect, useRef } from "react";
import { socket } from "../utils/Socket"; // Assuming socket is initialized here

interface ChatMessage {
  name: string;
  text: string;
  isSelf: boolean; // To distinguish between own messages and others'
}

interface ChatPopoverProps {
  
  currentUserRole: "student" | "teacher";
  currentUserName: string;
}

const ChatPopover: React.FC<ChatPopoverProps> = ({ currentUserRole, currentUserName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Emit the message to the server
      socket.emit("messege", { name: currentUserName, text: newMessage.trim() });
      setNewMessage("");
    }
  };

  useEffect(() => {
  const handleStudentMessage = ({ name, text }: { name: string; text: string }) => {
    console.log("🟢 Student message received:", name, text);
    setMessages((prevMessages) => [
      ...prevMessages,
      { name, text, isSelf: name === currentUserName },
    ]);
  };

  const handleTeacherMessage = (text: string) => {
    console.log("🟢 Teacher message received:", text);
    const messageText = text.replace("teacher : ", "");
    setMessages((prevMessages) => [
      ...prevMessages,
      { name: "Teacher", text: messageText, isSelf: currentUserRole === "teacher" },
    ]);
  };

  socket.on("stundet_messege", handleStudentMessage);
  socket.on("teacher_messege", handleTeacherMessage);

  return () => {
    socket.off("stundet_messege", handleStudentMessage);
    socket.off("teacher_messege", handleTeacherMessage);
  };
}, []); // ✅ empty dependency array so it runs only once


  useEffect(() => {
    // Scroll to the bottom of the chat when new messages arrive
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Floating Chat Icon (Bottom Right) */}
      <div
        className="fixed bottom-8 right-8 bg-purple-primary p-4 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={toggleChat}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Chat Popover */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-dark-bg-card rounded-lg shadow-xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-purple-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Class Chat</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96">
            {messages.length === 0 ? (
              <p className="text-dark-text-secondary text-center">No messages yet. Start chatting!</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-3 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[75%] ${
                      msg.isSelf
                        ? "bg-purple-secondary text-white"
                        : "bg-gray-700 text-dark-text"
                    }`}
                  >
                    <span className="block text-xs font-bold mb-1">
                      {msg.isSelf ? "You" : msg.name}
                    </span>
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatMessagesEndRef} /> {/* Scroll target */}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-dark-text placeholder-gray-400 focus:outline-none focus:border-purple-primary"
              />
              <button
                type="submit"
                className="bg-purple-primary text-white px-4 py-2 rounded-r-md hover:bg-purple-secondary transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatPopover;