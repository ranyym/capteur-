const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = createServer(app); // Création du serveur HTTP

// Configuration WebSocket
const wss = new WebSocketServer({ server }); // Utilisation du serveur HTTP

app.use(cors());
app.use(express.json());

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/iot_data?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Schéma de données
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Routes API REST
app.post('/api/data', async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const newData = new SensorData({ temperature, humidity });
    await newData.save();
    
    // Diffuser aux clients WebSocket
    broadcastData(newData);
    res.status(201).send('Data saved');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Gestion WebSocket
function broadcastData(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Nouveau client WebSocket connecté');
  
  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
  console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
});