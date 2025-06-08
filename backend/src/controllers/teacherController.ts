
import { Socket } from "dgram";
import { Server } from "socket.io";


interface Poll {
  question: string;
  options: string[];
  votes: number[];
  createdAt?: Date;
}

export class TeacherController {
  private io: Server;
  private activeStudents: Set<string> = new Set();
  private currentPoll: Poll | null = null;
  private studentAnswers: Record<string, number> = {};
  private pollTimer: NodeJS.Timeout | null = null;
  private pollHistory: Poll[] = [];
  private pollTicker: NodeJS.Timeout | null = null;
  private chatBox: Map<string, string[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }
  nameCheck(name:string){
    if(this.activeStudents.has(name)){
        return true
    }
    return false
  }

  registerStudent(name: string) {
    
    this.activeStudents.add(name);
  }

createPoll(question: string, options: string[], duration: number = 60) {
  if (this.currentPoll !== null) return;

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
  submitAnswer(student: string, optionIndex: number) {
    if (!this.currentPoll || this.studentAnswers[student] !== undefined) return;

    this.studentAnswers[student] = optionIndex;
    this.currentPoll.votes[optionIndex]++;


    this.io.emit("poll_results",this.currentPoll)

    if (Object.keys(this.studentAnswers).length === this.activeStudents.size){
      console.log("length reacherd")
      if (this.pollTimer) clearTimeout(this.pollTimer);
      this.endPoll();
    }
  }

  private async endPoll() {
    if (!this.currentPoll) return;

    this.io.emit("poll_results", this.currentPoll);
    // await PollModel.create(this.currentPoll);
    console.log(this.currentPoll)
    this.pollHistory.push(this.currentPoll);
    this.currentPoll = null;
    this.io.emit("allow_new_poll");
  }
  sendMessege(name: string,text:string){

    if(this.activeStudents.has(name)){
      this.io.emit("stundet_messege",{name,text});
    }else{
      this.io.emit("teacher_messege", "teacher : "+text);

    }
    const userMessages = this.chatBox.get(!name?"teacher":name) ?? [];
    userMessages.push(text);
    this.chatBox.set((!name)?"teacher":name, userMessages);

  }

  getPollHistory() {
    console.log("this is the current poal his",this.pollHistory)
    return this.pollHistory;
  }

  kickStudent(name: string) {
    this.activeStudents.delete(name);
    this.io.emit("student_kicked", name);
  }


  getActiveStudentCount() {
    return this.activeStudents.size;
  }
}
