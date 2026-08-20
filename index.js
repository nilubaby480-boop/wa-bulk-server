const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://nilubaby409_db_user:UphSij6mLcYMhMiv@cluster0.h4qvmyr.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("DB Error:", err));

// Test Home Route
app.get('/', (req, res) => {
    res.send("Server is Live & Working!");
});

// Main Schedule Route
app.post('/schedule', (req, res) => {
    const { contacts, message, repeatDays } = req.body;
    console.log("Data Received:", contacts, message, repeatDays);
    res.status(200).json({ status: "success", message: "Task Scheduled!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
