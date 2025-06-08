"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
class TeacherController {
    constructor(io) {
        this.activeStudents = new Set();
        this.currentPoll = null;
        this.studentAnswers = {};
        this.pollTimer = null;
        this.pollHistory = [];
        this.pollTicker = null;
        this.chatBox = new Map();
        this.io = io;
    }
    nameCheck(name) {
        if (this.activeStudents.has(name)) {
            return true;
        }
        return false;
    }
    registerStudent(name) {
        this.activeStudents.add(name);
    }
    createPoll(question, options, duration = 60) {
        if (this.currentPoll !== null)
            return;
        this.currentPoll = {
            question,
            options,
            votes: Array(options.length).fill(0),
        };
        this.studentAnswers = {};
        this.io.emit("new_poll", { question, options, duration });
        console.log("🟢 New Poll:", this.currentPoll);
        this.io.emit("poll_results", this.currentPoll);
        let timeLeft = duration;
        // Emit tick every second
        this.pollTicker = setInterval(() => {
            timeLeft--;
            this.io.emit("poll_tick", { timeLeft });
            if (timeLeft <= 0) {
                if (this.pollTicker !== null) {
                    clearInterval(this.pollTicker);
                    this.pollTicker = null;
                }
            }
        }, 1000);
        // End poll after duration
        this.pollTimer = setTimeout(() => {
            if (this.pollTicker !== null) {
                clearInterval(this.pollTicker);
                this.pollTicker = null;
            }
            this.endPoll();
        }, duration * 1000);
    }
    submitAnswer(student, optionIndex) {
        if (!this.currentPoll || this.studentAnswers[student] !== undefined)
            return;
        this.studentAnswers[student] = optionIndex;
        this.currentPoll.votes[optionIndex]++;
        this.io.emit("poll_results", this.currentPoll);
        if (Object.keys(this.studentAnswers).length === this.activeStudents.size) {
            console.log("length reacherd");
            if (this.pollTimer)
                clearTimeout(this.pollTimer);
            this.endPoll();
        }
    }
    endPoll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentPoll)
                return;
            this.io.emit("poll_results", this.currentPoll);
            // await PollModel.create(this.currentPoll);
            console.log(this.currentPoll);
            this.pollHistory.push(this.currentPoll);
            this.currentPoll = null;
            this.io.emit("allow_new_poll");
        });
    }
    sendMessege(name, text) {
        var _a;
        if (this.activeStudents.has(name)) {
            this.io.emit("stundet_messege", { name, text });
        }
        else {
            this.io.emit("teacher_messege", "teacher : " + text);
        }
        const userMessages = (_a = this.chatBox.get(!name ? "teacher" : name)) !== null && _a !== void 0 ? _a : [];
        userMessages.push(text);
        this.chatBox.set((!name) ? "teacher" : name, userMessages);
    }
    getPollHistory() {
        console.log("this is the current poal his", this.pollHistory);
        return this.pollHistory;
    }
    kickStudent(name) {
        this.activeStudents.delete(name);
        this.io.emit("student_kicked", name);
    }
    getActiveStudentCount() {
        return this.activeStudents.size;
    }
}
exports.TeacherController = TeacherController;
