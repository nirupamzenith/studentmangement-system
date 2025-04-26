const express = require("express");
const router = express.Router();
const Course = require("../models/Courses");
const mongoose = require("mongoose");

// GET all courses with enrolled students using $lookup
router.get("/", async (req, res) => {
  try {
    const result = await Course.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "enrolledCourses",
          as: "enrolledStudents",
        },
      },
      {
        $project: {
          courseName: 1,
          instructor: 1,
          credits: 1,
          enrolledStudents: {
            name: 1,
            email: 1,
            age: 1,
          },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error using $lookup:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST a new course
router.post("/", async (req, res) => {
  const { courseName, instructor, credits } = req.body;

  try {
    const newCourse = new Course({ courseName, instructor, credits });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: "Error creating course" });
  }
});

// GET course by ID with enrolled students using $lookup
router.get("/:id", async (req, res) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.id);

    const result = await Course.aggregate([
      { $match: { _id: courseId } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "enrolledCourses",
          as: "students",
        },
      },
      {
        $project: {
          courseName: 1,
          instructor: 1,
          credits: 1,
          students: {
            name: 1,
          },
        },
      },
    ]);

    if (!result.length) return res.status(404).json({ error: "Course not found" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching course" });
  }
});

// PUT (update) a course
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: "Error updating course" });
  }
});

// DELETE a course
router.delete("/:id", async (req, res) => {
  const Student = require("../models/Students");

  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Course not found" });

    await Student.updateMany(
      { enrolledCourses: deleted._id },
      { $pull: { enrolledCourses: deleted._id } }
    );

    res.json({ message: "Course deleted and removed from students" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting course" });
  }
});

// SEARCH courses by course name or student name using $lookup
router.get("/search", async (req, res) => {
  const { course, name } = req.query;

  try {
    const matchStage = {};

    if (course && course.trim()) {
      matchStage.courseName = { $regex: new RegExp(course, "i") };
    }

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "enrolledCourses",
          as: "students",
        },
      },
    ];

    if (name && name.trim()) {
      aggregationPipeline.push({
        $addFields: {
          students: {
            $filter: {
              input: "$students",
              as: "student",
              cond: {
                $regexMatch: {
                  input: "$$student.name",
                  regex: new RegExp(name, "i"),
                },
              },
            },
          },
        },
      });

      aggregationPipeline.push({
        $match: { "students.0": { $exists: true } },
      });
    }

    const results = await Course.aggregate(aggregationPipeline);
    res.json(results);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

module.exports = router;