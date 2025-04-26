import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentForm from "./StudentForm.jsx";
import CourseForm from "./CourseForm.jsx";
import StudentList from "./StudentList.jsx";
import CourseList from "./CourseList.jsx";
import Navbar from "./Navbar.jsx";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/add-student" element={<StudentForm />} />
        <Route path="/add-course" element={<CourseForm />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/courses" element={<CourseList />} />
      </Routes>
    </Router>
  );
};

export default App;
