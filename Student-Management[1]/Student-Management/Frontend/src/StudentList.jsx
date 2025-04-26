import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CSS/StudentList.module.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editedCourses, setEditedCourses] = useState("");
  const [allCourses, setAllCourses] = useState([]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students");
      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/courses"); // Fetch all available courses
      setAllCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students/search", {
        params: {
          name: searchName,
          course: searchCourse,
        },
      });
      setStudents(response.data);
    } catch (err) {
      console.error("Error searching students", err);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditedCourses(student.enrolledCourses?.map((course) => course.courseName).join(", ") || "");
  };

  const handleDelete = async (studentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`);
      setStudents(students.filter((student) => student._id !== studentId));
    } catch (err) {
      console.error("Error deleting student", err);
    }
  };

  const handleCourseEditChange = (e) => {
    setEditedCourses(e.target.value);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Split the entered course names and find their corresponding course IDs
    const courseNames = editedCourses.split(",").map((course) => course.trim());
    const courseIds = courseNames
      .map((courseName) => {
        const course = allCourses.find((course) => course.courseName.toLowerCase() === courseName.toLowerCase());
        return course ? course._id : null;
      })
      .filter((courseId) => courseId !== null);

    try {
      const response = await axios.put(`http://localhost:5000/api/students/${editingStudent._id}`, {
        enrolledCourses: courseIds, // Pass course IDs
      });

      // Update the student list with the new student data
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === editingStudent._id ? response.data : student
        )
      );

      // Clear the form after updating
      setEditingStudent(null);
      setEditedCourses("");
    } catch (err) {
      console.error("Error updating courses", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllCourses(); // Fetch all courses when the component loads
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Student List</h2>

      {/* Search Box */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by student name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Search by course name"
          value={searchCourse}
          onChange={(e) => setSearchCourse(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSearch} className={styles.button}>
          Search
        </button>
      </div>

      {/* Edit Course Form (Appears when editing a student) */}
      {editingStudent && (
        <div className={styles.editForm}>
          <h3>Edit Courses for {editingStudent.name}</h3>
          <form onSubmit={handleEditSubmit}>
            <div>
              <input
                type="text"
                value={editedCourses}
                onChange={handleCourseEditChange}
                placeholder="Enter course names (comma-separated)"
                className={styles.input}
                required
              />
            </div>
            <button type="submit" className={styles.button}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Student Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Courses</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td data-label="Name">{student.name}</td>
              <td data-label="Email">{student.email}</td>
              <td data-label="Age">{student.age}</td>
              <td data-label="Courses">
  {Array.isArray(student.enrolledCourses) && student.enrolledCourses.length > 0
    ? student.enrolledCourses
        .filter((course) => course && course.courseName) // Filter out null/undefined
        .map((course) => course.courseName)
        .join(", ")
    : "None"}
</td>
              <td data-label="Actions">
                <button onClick={() => handleEdit(student)} className={styles.editButton}>
                  Edit
                </button>
                <button onClick={() => handleDelete(student._id)} className={styles.deleteButton}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
