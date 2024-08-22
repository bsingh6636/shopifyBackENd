import express from "express"

import dotenv from "dotenv"

import cors from 'cors'

import { MongoClient } from "mongodb"

dotenv.config({ path: "./config.env"})

  const url = process.env.MONGO_URL;
  const dbname = process.env.DB_NAME;
  const client = new MongoClient(url);

const app = express()



app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// app.use('/api',orderRouter)
app.post('/api/getData', async (req, res) => {
    const { collectionName } = req.body;

    // Validate collectionName
    if (!collectionName || typeof collectionName !== 'string') {
        return res.status(400).json({ error: 'Invalid collection name.' });
    }

    console.log(collectionName);

    try {
        // Assuming client is already connected or connects once on app startup
        const db = client.db(dbname);
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while processing your request.',error });
    }
    // No need to close connection here if maintaining a persistent connection
});

app.listen(PORT , () =>{
    console.log(`server listening on PORT ${PORT}`)
})