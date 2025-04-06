import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import NewCourse from "./NewCourse";
import PasswordProtect from "./PasswordProtect";
import CourseDetail from "./CourseDetail";
import CategoryEditor from "./CategoryEditor";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PasswordProtect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/newcourse" element={<NewCourse />} />
        <Route path="/coursedetail/:id" element={<CourseDetail />} />
        <Route
          path="/categoryeditor"
          element={<CategoryEditor onClose={() => {}} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 