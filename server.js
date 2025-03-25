const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB directe
mongoose.connect('mongodb+srv://ranimferjeoui16:<Ranim*@2580>@cluster0.vd7qi.mongodb.net/?appName=Cluster0')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Modèle simplifié
const SensorData = mongoose.model('SensorData', new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
}));

// Routes minimales
app.post('/api/data', async (req, res) => {
  const data = await SensorData.create(req.body);
  res.status(201).json(data);
});

app.get('/api/data', async (req, res) => {
  const data = await SensorData.find().sort('-timestamp').limit(50);
  res.json(data);
});

// Démarrer le serveur
const port = 3000;
app.listen(port, () => console.log(`🚀 Serveur prêt sur http://localhost:${port}`));