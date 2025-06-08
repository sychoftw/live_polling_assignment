"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const teacherController_1 = require("./controllers/teacherController");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let teacherController = null;
let teacherSocketId = null;
io.on("connection", (socket) => {
    socket.on("register_teacher", () => {
        if (teacherController != null) {
            socket.emit("error", " A teacher is already registered.");
            console.log("Attempted second teacher registration:", socket.id);
        }
        else {
            console.log("teacher registered  ", socket.id);
            teacherController = new teacherController_1.TeacherController(io);
            teacherSocketId = socket.id;
            socket.data.role = "teacher";
        }
    });
    socket.on("register_student", (name) => {
        if (!teacherController) {
            socket.emit("error", "No teacher has started the session yet.");
            return;
        }
        if (!name || teacherController.nameCheck(name)) {
            socket.emit("name needed or already exist");
        }
        teacherController.registerStudent(name);
        socket.data.role = "student";
        socket.data.name = name;
        socket.emit("registered", "Student registered successfully.");
        console.log(" Student registered:", name);
    });
    socket.on("create_poll", ({ question, options, duration }) => {
        console.log("inside create poll");
        if (socket.data.role != "teacher") {
            socket.emit("error", " Only the teacher can create polls.");
            return;
        }
        teacherController === null || teacherController === void 0 ? void 0 : teacherController.createPoll(question, options, duration);
    });
    socket.on("messege", ({ name, text }) => {
        console.log("messege with ", name, " ", text);
        teacherController === null || teacherController === void 0 ? void 0 : teacherController.sendMessege(name, text);
    });
    socket.on("submit_answer", ({ name, optionIndex }) => {
        teacherController === null || teacherController === void 0 ? void 0 : teacherController.submitAnswer(name, optionIndex);
    });
    socket.on("kick_student", (name) => {
        if (socket.data.role == "teacher") {
            socket.emit("error", "Only the teacher can kick students.");
            return;
        }
        teacherController === null || teacherController === void 0 ? void 0 : teacherController.kickStudent(name);
    });
    socket.on("get_poll_history", () => {
        const history = teacherController === null || teacherController === void 0 ? void 0 : teacherController.getPollHistory();
        socket.emit("poll_history", history);
        console.log("history-----", history);
    });
    socket.on("disconnect", () => {
        if (socket.id == teacherSocketId) {
            teacherController = null;
            teacherSocketId = null;
        }
        console.log("Disconnected:", socket.id);
        if (socket.data.name) {
            teacherController === null || teacherController === void 0 ? void 0 : teacherController.kickStudent(socket.data.name);
        }
    });
});
server.listen(4000, () => console.log("Server running at http://localhost:4000"));
