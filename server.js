const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Application = require('./models/Application');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.post('/submit', async (req, res) => {
  const { idNumber, phoneNumber, newphoneNumber } = req.body;

  const recent = await Application.findOne({
    idNumber,
    submittedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  if (recent) return res.status(409).json({ message: "Request already submitted in the past 24h" });

  const application = new Application({ idNumber, phoneNumber, newphoneNumber });
  await application.save();

  res.status(201).json({ message: "Application received" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
