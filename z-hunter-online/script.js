// No topo do script.js
const socket = io({
    transports: ['websocket'],
    upgrade: false
});

let remotePlayers = {};

socket.on('connect', () => {
    console.log("Conectado ao servidor com ID:", socket.id);
});

socket.on('updatePlayers', (data) => {
    console.log("Jogadores recebidos:", data); // Isso vai aparecer no F12 do navegador
    remotePlayers = data;
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve os arquivos da pasta atual (index, script, style)
app.use(express.static(__dirname));

let players = {}; // Banco de dados temporário dos jogadores

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    // Cria o jogador com uma cor aleatória
    players[socket.id] = {
        x: 0,
        y: 0,
        angle: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    // Envia a lista de jogadores atualizada para TODO MUNDO
    io.emit('updatePlayers', players);

    // Quando um jogador se move, ele avisa o servidor
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            
            // O servidor avisa a todos os OUTROS onde este jogador está
            socket.broadcast.emit('updatePlayers', players);
        }
    });
    // Dentro da função draw(), depois de limpar a tela:
ctx.save();
ctx.translate(camera.x, camera.y);

// DESENHAR OUTROS JOGADORES
for (let id in remotePlayers) {
    if (id !== socket.id) {
        const p = remotePlayers[id];
        ctx.fillStyle = p.color || "blue";
        // IMPORTANTE: Aqui usamos p.x e p.y direto porque o translate(camera) já cuida do resto
        ctx.fillRect(p.x - 15, p.y - 15, 30, 30); 
    }
}

// Desenhar você
ctx.fillStyle = "green";
ctx.fillRect(player.x - 15, player.y - 15, 30, 30);

ctx.restore();

    // Quando alguém sai, remove da lista
    socket.on('disconnect', () => {
        console.log('Jogador saiu:', socket.id);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});