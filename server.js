require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const SensorData = require('./models/SensorData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// Route API pour recevoir les données
app.post('/api/sensors', async (req, res) => {
    try {
        const data = new SensorData(req.body);
        await data.save();
        io.emit('newData', data);
        res.status(201).json({ message: '✅ Données enregistrées', data });
    } catch (error) {
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
});

// WebSocket pour la connexion des clients
io.on('connection', (socket) => {
    console.log('🟢 Un client est connecté !');
    socket.on('disconnect', () => {
        console.log('🔴 Un client s’est déconnecté');
    });
});

// Lancer le serveur
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Serveur en ligne sur le port ${PORT}`));
