


const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const path = require("path");
const upload = require("./config/upload");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple welcome route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the School API!" });
});

// Register a new student
app.post("/api/students/register", upload.single("profile"), async (req, res) => {
  try {
    const { name, address, email, class: studentClass, password } = req.body;
    if (!name || !address || !email || !studentClass || !password || !req.file) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });
    const student = new Student({
      name,
      address,
      email,
      class: studentClass,
      password,
      profilePic: `/uploads/${req.file.filename}`,
    });
    await student.save();
    res.status(201).json({ message: "Student registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// Student login
app.post("/api/students/login", async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email, password });
  if (!student) return res.status(400).json({ message: "Invalid credentials." });
  res.json({ message: "Login successful.", student });
});

// Get all students with profilePic
app.get("/api/students", async (req, res) => {
  const students = await Student.find({ profilePic: { $exists: true, $ne: null } });
  res.json(students);
});

// Update student info
app.put("/api/students/:id", upload.single("profile"), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.profilePic = `/uploads/${req.file.filename}`;
    const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student updated.", student });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// Teacher registration (simple)
app.post("/api/teachers/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required." });
    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });
    const teacher = new Teacher({ name, email, password });
    await teacher.save();
    res.status(201).json({ message: "Teacher registered." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// Teacher login
app.post("/api/teachers/login", async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email, password });
  if (!teacher) return res.status(400).json({ message: "Invalid credentials." });
  res.json({ message: "Login successful.", teacher });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
