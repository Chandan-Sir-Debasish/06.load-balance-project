const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const os = require("os");

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongo:27017/loadbalancertest";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log(
      `Backend on port ${PORT} (host: ${os.hostname()}) connected to MongoDB`,
    ),
  )
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks, server: os.hostname() }); // <-- hostname
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      createdBy: os.hostname(), // <-- store which backend created it
    }); // <-- hostname});
    res.status(201).json({ task, server: os.hostname() }); // <-- hostname
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted", server: os.hostname() }); // <-- hostname
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
