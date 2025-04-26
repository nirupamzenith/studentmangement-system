import React, { useState } from "react";
import axios from "axios";
import styles from "./CSS/StudentForm.module.css";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    courseNames: "", // NEW: Comma-separated course names
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split courseNames into array of names
    const courseNameArray = formData.courseNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    try {
      const response = await axios.post("http://localhost:5000/api/students", {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        courseNames: courseNameArray, // send array to backend
      });

      alert("Student created successfully!");
      setFormData({ name: "", email: "", age: "", courseNames: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating student");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Student</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          className={styles.input}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          className={styles.input}
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="courseNames"
          placeholder="Enter course names (comma-separated)"
          className={styles.input}
          value={formData.courseNames}
          onChange={handleChange}
        />
        <button type="submit" className={styles.button}>
          Add Student
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
