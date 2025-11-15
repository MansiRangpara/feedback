const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();  // MUST be here

const app = express();
app.use(cors());
app.use(express.json());

// Debug: print env to confirm loaded
console.log("Loaded MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// SCHEMA
const Feedback = mongoose.model("Feedback", new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
}));

// ROUTES
app.post("/api/feedback", async (req, res) => {
  try {
    const fb = await Feedback.create(req.body);
    res.json(fb);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/feedback", async (req, res) => {
  const all = await Feedback.find().sort({ createdAt: -1 });
  res.json(all);
});

app.get("/api/stats", async (req, res) => {
  const all = await Feedback.find();
  const total = all.length;
  const avg = total ? all.reduce((a, b) => a + b.rating, 0) / total : 0;
  const positive = all.filter(f => f.rating >= 4).length;
  const negative = all.filter(f => f.rating <= 2).length;

  res.json({ total, avg, positive, negative });
});

// START SERVER
app.listen(5000, () => console.log("API running on 5000"));
