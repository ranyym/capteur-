const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Récupérez cette URI depuis MongoDB Atlas > Connect > Drivers
// 2. Remplacez USERNAME, PASSWORD, CLUSTERNAME et DATABASE
const MONGODB_URI = 'mongodb://ranimferjeoui16:Ranim2580@cluster0-shard-00-00.vd7qi.mongodb.net:27017,cluster0-shard-00-01.vd7qi.mongodb.net:27017,cluster0-shard-00-02.vd7qi.mongodb.net:27017/?replicaSet=atlas-ahcmuu-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Options de connexion importantes
const mongooseOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err.message);
    console.log('Vérifiez votre URI:', MONGODB_URI.replace(/:[^@]*@/, ':*****@'));
  });

// Modèle de données
const SensorData = mongoose.model('SensorData', new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
}));

// Routes
app.post('/api/data', async (req, res) => {
  try {
    const data = await SensorData.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
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

app.get('/api/data', async (req, res) => {
  try {
    const data = await SensorData.find().sort('-timestamp');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur prêt sur le port ${PORT}`));