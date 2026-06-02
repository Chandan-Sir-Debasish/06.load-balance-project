const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: String, default: "" }, // will store hostname
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
