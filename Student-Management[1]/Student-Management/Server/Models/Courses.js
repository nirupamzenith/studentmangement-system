const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  instructor: { type: String, required: true },
  credits: { type: Number, required: true },
});

module.exports = mongoose.model("Course", courseSchema);
