const express = require("express");
const router = express.Router();
const Student = require("../models/Students");
const Course = require("../models/Courses"); // Optional if you want to validate course IDs

// GET all students, optionally filter by courseId
router.get("/", async (req, res) => {
  const { courseId } = req.query;

  const matchStage = courseId ? { enrolledCourses: courseId } : {};

  try {
    const students = await Student.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses",
          foreignField: "_id",
          as: "enrolledCourses"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          age: 1,
          enrolledCourses: {
            courseName: 1,
            instructor: 1,
            credits: 1
          }
        }
      }
    ]);

    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).send("Server error");
  }
});

router.get("/search", async (req, res) => {
  const { name, course } = req.query;

  const matchStage = {};
  if (name) matchStage.name = { $regex: name, $options: "i" };

  try {
    const students = await Student.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses",
          foreignField: "_id",
          as: "enrolledCourses"
        }
      },
      {
        $match: course
          ? {
              "enrolledCourses.courseName": {
                $regex: course,
                $options: "i"
              }
            }
          : {}
      },
      {
        $project: {
          name: 1,
          email: 1,
          age: 1,
          enrolledCourses: {
            courseName: 1
          }
        }
      }
    ]);

    res.json(students);
  } catch (err) {
    console.error("Error searching students:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const students = await Student.aggregate([
      { $match: { _id: require("mongoose").Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses",
          foreignField: "_id",
          as: "enrolledCourses"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          age: 1,
          enrolledCourses: {
            courseName: 1,
            instructor: 1
          }
        }
      }
    ]);

    if (!students.length) return res.status(404).json({ error: "Student not found" });
    res.json(students[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student", details: err.message });
  }
});


// POST a new student using courseNames from frontend
router.post("/", async (req, res) => {
  try {
    const { name, email, age, courseNames } = req.body;

    // Convert courseNames to course IDs
    let enrolledCourses = [];
    if (courseNames && courseNames.length > 0) {
      const courses = await Course.find({ courseName: { $in: courseNames } });

      if (courses.length !== courseNames.length) {
        return res.status(400).json({
          error: "One or more course names are invalid",
        });
      }

      enrolledCourses = courses.map((course) => course._id);
    }

    const newStudent = new Student({
      name,
      email,
      age,
      enrolledCourses,
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ PUT (update) a student
router.put("/:id", async (req, res) => {
  const { name, email, age, enrolledCourses } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, age, enrolledCourses },
      { new: true, runValidators: true }
    ).populate("enrolledCourses", "courseName instructor");

    if (!updatedStudent) return res.status(404).json({ error: "Student not found" });
    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update student", details: err.message });
  }
});

// ✅ DELETE a student
router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student", details: err.message });
  }
});

// ✅ SEARCH students by name or email
router.get("/search/query", async (req, res) => {
  const { name, email } = req.query;

  try {
    let query = {};
    if (name) query.name = { $regex: new RegExp(name, "i") };
    if (email) query.email = { $regex: new RegExp(email, "i") };

    const students = await Student.find(query).populate("enrolledCourses", "courseName");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

module.exports = router;
