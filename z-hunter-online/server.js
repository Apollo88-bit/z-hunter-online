const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

app.use(express.static(__dirname));
// ... resto do código (io.on connection, etc)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

let players = {}; 

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    // Cria o jogador com posição inicial e cor
    players[socket.id] = {
        x: 400,
        y: 400,
        angle: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    // Envia a lista de todos os jogadores para quem acabou de entrar
    io.emit('updatePlayers', players);

    // Recebe movimento e repassa para os outros
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            // Transmite a lista atualizada para todos
            io.emit('updatePlayers', players);
        }
    });

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