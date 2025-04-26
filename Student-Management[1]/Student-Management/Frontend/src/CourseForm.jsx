import React, { useState } from "react";
import axios from "axios";
import styles from "./CSS/CourseForm.module.css";

const CourseForm = () => {
  const [formData, setFormData] = useState({
    courseName: "",
    instructor: "",
    credits: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make the API call to create a course
      const response = await axios.post("http://localhost:5000/api/courses", formData);
      
      // Ensure the response has data before accessing it
      if (response && response.data) {
        console.log("Course added:", response.data);
        setFormData({ courseName: "", instructor: "", credits: "" }); // Reset form
        setSuccessMessage("Course added successfully!"); // Success message
        setError(""); // Clear any previous error
      } else {
        setError("No data returned from the server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error adding course: " + (err.response ? err.response.data.error : "Unknown error"));
      setSuccessMessage(""); // Clear success message if error occurs
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Course</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="courseName">Course Name</label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instructor">Instructor</label>
          <input
            type="text"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="credits">Credits</label>
          <input
            type="number"
            id="credits"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            required
            min="1"
            max="10"
          />
        </div>

        <button type="submit">Add Course</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default CourseForm;
