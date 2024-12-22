const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const PORT = 3000;
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = socketio(server);

const rooms = [];

const apiRouter = express.Router();

apiRouter.get('/room', (req, res) => {
  const roomsWithOccupants = rooms.map(room => ({
    ...room,
    occupants: getRoomOccupants(room.id)
  }));
  res.json(roomsWithOccupants);
});

apiRouter.post('/room', (req, res) => {
  const { name, id } = req.body;
  if (typeof name === 'string' && typeof id === 'string') {
    rooms.push({ name, id });
    res.status(201).json({ message: 'Room added', room: { name, id } });
  } else {
    res.status(400).json({ message: 'Invalid room data' });
  }
});

apiRouter.get('/join/:id', (req, res) => {
  const roomId = req.params.id;
  const roomIdx = rooms.findIndex(r => r.id === roomId);
  if (roomIdx !== -1) {
    res.cookie('roomId', roomId).cookie('roomName', rooms[roomIdx].name).redirect('/');
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

apiRouter.get('/oauth', (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`);
});

apiRouter.get('/oauth/callback', (req, res) => {
  const { code } = req.query;
  fetch(`https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${code}`)
  .then(response => response.json())
  .then(data => {
    fetch(`https://api.github.com/user?access_token=${data.access_token}`)
    .then(response => response.json())
    .then(user => {
      res.cookie('username', user.login).redirect('/');
    });
  }).catch(error => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });
});

apiRouter.get('/vaild', (req, res) => {
  const username = req.cookies.username;
  fetch(`https://api.github.com/users/${username}`)
  .then(response => response.json())
  .then(user => {
    if (user.login === username) res.json({ valid: true });
    else res.json({ valid: false });
  }).catch(() => {
    res.json({ valid: false });
  });
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'lib', 'index.html'));
});

app.get('/*', (req, res) => {
  const filePath = path.join(__dirname, 'lib', req.path);
  res.sendFile(filePath);
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const blacklist = new Set();
  const userRooms = new Set();

  socket.on('joinRoom', (room) => {
    const roomExists = rooms.some(r => r.id === room);
    if (roomExists) {
      socket.join(room);
      userRooms.add(room);
      const occupantCount = getRoomOccupants(room);
      io.to(room).emit('occupantCount', { room, count: occupantCount });
    } else {
      console.log(`Room ${room} does not exist`);
    }
  });

  socket.on('leaveRoom', (room) => {
    const roomExists = rooms.some(r => r.id === room);
    if (roomExists) {
      socket.leave(room);
      userRooms.delete(room);
      const occupantCount = getRoomOccupants(room);
      io.to(room).emit('occupantCount', { room, count: occupantCount });
    } else {
      console.log(`Room ${room} does not exist`);
    }
  });

  socket.on('message', (data) => {
    const { name, message, room } = data;
    const roomExists = rooms.some(r => r.id === room);
    if (roomExists && typeof name === 'string' && name.length <= 20 && typeof message === 'string' && message.length <= 50) {
      io.to(room).emit('message', data);
    } else {
      console.log('Invalid data received or room does not exist');
      blacklist.add(socket.id);
      socket.disconnect();
    }
  });

  socket.on('disconnect', () => {
    if (blacklist.has(socket.id)) return;
  });
});

function getRoomOccupants(room) {
  return io.sockets.adapter.rooms.get(room)?.size || 0;
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
