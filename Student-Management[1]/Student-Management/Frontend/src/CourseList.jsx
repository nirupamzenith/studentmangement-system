import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CSS/CourseList.module.css";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [editCourse, setEditCourse] = useState(null); // Track the course being edited
  const [editCourseData, setEditCourseData] = useState({
    courseName: "",
    instructor: "",
    credits: "",
  });
  const [error, setError] = useState("");
  const [studentsByCourse, setStudentsByCourse] = useState({}); // To store students for each course

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses from the server
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/courses");
      setCourses(response.data);
      fetchEnrolledStudents(response.data); // Fetch students for all courses once courses are fetched
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Fetch enrolled students for a specific course
const fetchEnrolledStudents = async (courses) => {
  try {
    const studentsData = {};

    // For each course, fetch students only for that course by courseId
    for (let course of courses) {
      const response = await axios.get("http://localhost:5000/api/students", {
        params: { courseId: course._id }, // Fetch only students enrolled in this course
      });

      // Save the students under the specific course ID
      studentsData[course._id] = response.data;
    }

    // After fetching students, store them in state
    setStudentsByCourse(studentsData);
  } catch (err) {
    console.error("Error fetching enrolled students:", err);
  }
};

  // Handle course search input
  const handleCourseSearchChange = (e) => {
    setCourseSearch(e.target.value);
  };

  // Handle student search input
  const handleStudentSearchChange = (e) => {
    setStudentSearch(e.target.value);
  };

  // Handle search submit for both course name and student name
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:5000/api/courses/search", {
        params: { course: courseSearch, name: studentSearch },
      });
      setCourses(response.data);
      fetchEnrolledStudents(response.data); // Re-fetch students after search
    } catch (err) {
      console.error("Error searching courses:", err);
    }
  };

  // Handle the edit button click
  const handleEdit = (course) => {
    setEditCourse(course);
    setEditCourseData({
      courseName: course.courseName,
      instructor: course.instructor,
      credits: course.credits,
    });
  };

  // Handle input changes for the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCourseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit the updated course data to the backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/courses/${editCourse._id}`, editCourseData);
      setCourses((prevCourses) => prevCourses.map((course) =>
        course._id === editCourse._id ? response.data : course
      ));
      setEditCourse(null); // Clear the edit form after successful update
      setEditCourseData({ courseName: "", instructor: "", credits: "" });
    } catch (err) {
      setError("Error updating course");
    }
  };

  // Handle the delete button click
  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      setStudentsByCourse((prev) => {
        const newData = { ...prev };
        delete newData[courseId]; // Remove the students for the deleted course
        return newData;
      });
    } catch (err) {
      setError("Error deleting course");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Courses List</h2>

      {/* Error message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Edit Course Form */}
      {editCourse && (
        <div className={styles.editForm}>
          <h3>Edit Course</h3>
          <form onSubmit={handleEditSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="courseName"
                value={editCourseData.courseName}
                onChange={handleEditChange}
                placeholder="Course Name"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="instructor"
                value={editCourseData.instructor}
                onChange={handleEditChange}
                placeholder="Instructor"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="number"
                name="credits"
                value={editCourseData.credits}
                onChange={handleEditChange}
                placeholder="Credits"
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>Save</button>
          </form>
          <button onClick={() => setEditCourse(null)} className={styles.cancelButton}>Cancel</button>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={courseSearch}
            onChange={handleCourseSearchChange}
            placeholder="Search by course name"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={studentSearch}
            onChange={handleStudentSearchChange}
            placeholder="Search by student name"
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Instructor</th>
            <th>Credits</th>
            <th>Enrolled Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course._id}>
                <td>{course.courseName}</td>
                <td>{course.instructor}</td>
                <td>{course.credits}</td>
                <td>
                  {studentsByCourse[course._id] && studentsByCourse[course._id].length > 0
                    ? studentsByCourse[course._id].map((student) => student.name).join(", ")
                    : "No students enrolled"}
                </td>
                <td>
                  <button onClick={() => handleEdit(course)} className={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(course._id)} className={styles.deleteButton}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No courses found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
