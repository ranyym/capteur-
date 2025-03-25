// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
// Connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://ranimferjeoui16:<Ranim*@2580>@cluster0.vd7qi.mongodb.net/?appName=Cluster0"');

// Schéma de données
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Route pour recevoir les données de l'ESP32
app.post('/api/data', async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const newData = new SensorData({ temperature, humidity });
    await newData.save();
    res.status(201).send('Data saved');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route pour récupérer les données
app.get('/api/data', async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Ajoutez ceci à server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Envoi périodique des nouvelles données
  const sendData = async () => {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(1);
    ws.send(JSON.stringify(data[0]));
  };
  
  const interval = setInterval(sendData, 5000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});