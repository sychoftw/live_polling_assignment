import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

let socket: any;

const TeacherPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
    navigate("/createpoll", { state: { socket } });
  }, []);

  return <div>Registering as Teacher...</div>;
};

export default TeacherPage;