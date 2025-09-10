const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { type: String }, // path to uploaded image
});

module.exports = mongoose.model("Student", studentSchema);
