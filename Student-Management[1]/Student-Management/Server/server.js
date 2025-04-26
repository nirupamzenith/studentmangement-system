const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
const studentRoutes = require('./Routes/Students');
const courseRoutes = require('./Routes/Courses');

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);

app.use(cors());



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
