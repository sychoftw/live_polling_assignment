// src/App.tsx

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RoleSelection from "./pages/Roleselection"
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import CreatePoll from "./pages/CreatePoll";
import VotePoll from "./pages/votepoll";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection/>} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/createpoll" element={<CreatePoll />} />
        <Route path="/votepoll" element={<VotePoll />} />
      </Routes>
    </Router>
  );
};

export default App;
