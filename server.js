const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB (à remplacer par vos variables d'environnement)
mongoose.connect('mongodb://ranimferjeoui16:Ranim580@cluster0-shard-00-00.vd7qi.mongodb.net:27017,cluster0-shard-00-01.vd7qi.mongodb.net:27017,cluster0-shard-00-02.vd7qi.mongodb.net:27017/?replicaSet=atlas-ahcmuu-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Modèle de données
const SensorData = mongoose.model('SensorData', new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
}));

// Route racine - Version HTML intégrée
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API IoT</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>API IoT Opérationnelle</h1>
      <p>Endpoints disponibles :</p>
      
      <div class="endpoint">
        <h3>POST /api/data</h3>
        <p>Envoyer des données de capteur</p>
        <pre>{
  "temperature": 25.5,
  "humidity": 60
}</pre>
      </div>
      
      <div class="endpoint">
        <h3>GET /api/data</h3>
        <p>Récupérer les dernières mesures</p>
        <a href="/api/data" target="_blank">Voir les données</a>
      </div>
    </body>
    </html>
  `);
});

// Routes API existantes
app.post('/api/data', async (req, res) => {
  try {
    const data = await SensorData.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await SensorData.find().sort('-timestamp');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur prêt sur le port ${PORT}`);
});