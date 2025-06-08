import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


let socket: any;

const TeacherPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
    navigate("/createpoll", { state: { socket } });
  }, []);

  return <div>Registering as Teacher...</div>;
};

export default TeacherPage;