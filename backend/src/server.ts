import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { TeacherController } from "./controllers/teacherController"
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const CLIENT_ORIGIN = process.env.CLIENT_URL || "*";

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ["GET", "POST"],
}));

app.use(express.json());





let teacherController: TeacherController | null = null;
let teacherSocketId: string | null = null;

io.on("connection", (socket) => {
  socket.on("register_teacher", () => {
    if(teacherController!=null){
      socket.emit("error", " A teacher is already registered.");
      console.log("Attempted second teacher registration:", socket.id);

    }else{
      console.log("teacher registered  ",socket.id)
      teacherController = new TeacherController(io);
      teacherSocketId=socket.id
      socket.data.role="teacher"

    }
  });

  socket.on("register_student", (name: string) => {
    if (!teacherController) {
      socket.emit("error", "No teacher has started the session yet.");
      return;
    }
    if(!name||teacherController.nameCheck(name)){
      socket.emit("name needed or already exist");
    }  


    teacherController.registerStudent(name);
    socket.data.role = "student";
    socket.data.name = name;
    socket.emit("registered", "Student registered successfully.");
    console.log(" Student registered:", name);  
  });

  socket.on("create_poll", ({ question, options, duration }) => {
    console.log("inside create poll")
    if (socket.data.role!="teacher") {
      socket.emit("error", " Only the teacher can create polls.");
      return;
    }
    teacherController?.createPoll(question, options, duration);
  });

  socket.on("messege", ({ name, text}) => {
    console.log("messege with ",name," ",text)
    
    teacherController?.sendMessege(name, text);
  });

  socket.on("submit_answer", ({ name, optionIndex }) => {
    teacherController?.submitAnswer(name, optionIndex);
  });
  

  socket.on("kick_student", (name: string) => {
    if (socket.data.role=="teacher") {
      socket.emit("error", "Only the teacher can kick students.");
      return;
    }
    teacherController?.kickStudent(name);
  });

  socket.on("get_poll_history", () => {
    const history = teacherController?.getPollHistory();
    socket.emit("poll_history", history);
    console.log("history-----",history)
  });

  socket.on("disconnect", () => {
    if(socket.id==teacherSocketId){
      teacherController=null;
      teacherSocketId=null;
    }
    console.log("Disconnected:", socket.id);
    if (socket.data.name) {
      teacherController?.kickStudent(socket.data.name);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
