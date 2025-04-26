import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./CSS/Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <NavLink to="/students" className={({ isActive }) => isActive ? styles.active : ""}>Student List</NavLink>
      <NavLink to="/add-student" className={({ isActive }) => isActive ? styles.active : ""}>Add Student</NavLink>
      <NavLink to="/courses" className={({ isActive }) => isActive ? styles.active : ""}>Course List</NavLink>
      <NavLink to="/add-course" className={({ isActive }) => isActive ? styles.active : ""}>Add Course</NavLink>
    </nav>
  );
};

export default Navbar;
