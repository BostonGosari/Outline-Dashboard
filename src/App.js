import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import NewCourse from "./NewCourse";
import PasswordProtect from "./PasswordProtect";
import CourseDetail from "./CourseDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordProtect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<NewCourse />} />
        <Route path="/details/:id" element={<CourseDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
