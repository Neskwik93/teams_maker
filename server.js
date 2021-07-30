require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.static('static'));
app.use(cors());

const httpServer = require("http").createServer(app);
const options = {};
const io = require("socket.io")(httpServer, options);
const Api = require('./services/api');

//let password = 'LycharLeBoss123'
let password = ''

let ttUser = [];
let clientAdminId;
let tournamentOpen = true;

io.on("connection", (client) => {

  client.on('setAdmin', (str, callback) => {
    if (str === password) { // si quelqu'un d'autre essaye et se trompe ça n'enlève pas l'admin existant
      clientAdminId = client.id;
    }
    callback(str === password);
  });

  client.on('checkTournamentOpen', (callback) => {
    if (tournamentOpen || ttUser.find(u => u.clientId === client.id)) callback(true);
    else io.to(client.id).emit('error', 'Un tournoi est déjà en cours');
  });

  client.on('searchPlayer', async (data, callback) => {
    if (tournamentOpen) {
      data.platform = encodeURIComponent(data.platform);
      data.strSearched = encodeURIComponent(data.strSearched);
      let res = await Api.get('api.tracker.gg', '/api/v2/rocket-league/standard/search?platform=' + data.platform + '&query=' + data.strSearched + '&autocomplete=true')
      callback(res);
    } else io.to(client.id).emit('error', 'Un tournoi est déjà en cours');
  });

  client.on('getPlayer', async (data, callback) => {
    if (tournamentOpen) {
      data.platform = encodeURIComponent(data.platform);
      data.strSearched = encodeURIComponent(data.strSearched);
      data.userId = encodeURIComponent(data.userId);
      let res = await Api.get('api.tracker.gg', '/api/v2/rocket-league/standard/profile/' + data.platform + '/' + data.userId);
      if (res.errors && res.errors.length > 0) {
        io.to(client.id).emit('error', 'Joueur introuvable: ' + res.errors[0].message);
      } else {
        res.data.clientId = client.id;
        callback(res);
      }
    } else io.to(client.id).emit('error', 'Un tournoi est déjà en cours');
  });

  client.on('getUsers', () => {
    io.emit('updateUser', ttUser || []);
  });

  client.on('addPlayer', (player, callback) => {
    if (tournamentOpen) {
      let userExists = ttUser.findIndex(u => u.clientId === client.id);
      if (userExists !== -1) ttUser.splice(userExists, 1);
      player.clientId = client.id;
      ttUser.push(player);
      io.emit('updateUser', ttUser);
      callback(player)
    } else io.to(client.id).emit('error', 'Un tournoi est déjà en cours');
  });

  client.on('removePlayer', (user) => { // removes by himself
    let id = ttUser.findIndex(u => u.clientId === user.clientId);
    if (id !== -1) {
      ttUser.splice(id, 1);
      if(!tournamentOpen) io.emit('updateUserReady', ttUser);
      else io.emit('updateUser', ttUser);
    }
  });

  client.on('removeUser', (userId) => { // removed by admin
    if (client.id === clientAdminId) {
      let id = ttUser.findIndex(u => u.clientId === userId);
      if (id !== -1) {
        ttUser.splice(id, 1);
        if (!tournamentOpen) io.emit('updateUserReady', ttUser);
        else io.emit('updateUser', ttUser);
      }
    } else io.to(client.id).emit('error', 'Vous n\'êtes pas administrateur du tournoi');
  })

  client.on('askReady', () => {
    if (tournamentOpen) {
      if (client.id === clientAdminId) {
        tournamentOpen = false;
        ttUser.forEach(u => {
          io.to(u.clientId).emit('ruReady');
        });
      } else io.to(client.id).emit('error', 'Vous n\'êtes pas administrateur du tournoi');
    } else io.to(client.id).emit('error', 'Un tournoi est déjà en cours');
  });

  client.on('setReady', () => {
    let user = ttUser.find(u => u.clientId === client.id);
    if (user) {
      user.ready = true;
      io.emit('updateUserReady', ttUser);
    }
  });

  client.on('lastStep', () => {
    if (client.id === clientAdminId) {
      ttUser.forEach(u => {
        io.to(u.clientId).emit('lastStep');
      });
    } else io.to(client.id).emit('error', 'Vous n\'êtes pas administrateur du tournoi');
  });

  client.on('createTeams', (ttTeam) => {
    io.emit('displayTeams', (ttTeam));
  });

  client.on('cancelTournament', () => {
    if (client.id === clientAdminId) {
      tournamentOpen = true;
      ttUser.forEach(u => u.ready = false);
      io.emit('updateUser', ttUser);
    } else io.to(client.id).emit('error', 'Vous n\'êtes pas administrateur du tournoi');
  });

  client.on('disconnect', () => { // se déclenche automatiquement quand on ferme l'onglet
    let userToRemove = ttUser.findIndex(u => u.clientId === client.id);
    if (client.id === clientAdminId) {
      ttUser = [];
      clientAdminId = null;
      tournamentOpen = true;
    }
    if (userToRemove !== -1) {
      ttUser.splice(userToRemove, 1);
      if (!tournamentOpen) io.emit('updateUserReady', ttUser);
      else io.emit('updateUser', ttUser);
    }
    if (ttUser.length === 0) {
      tournamentOpen = true;
    }
  });

});

httpServer.listen(process.env.PORT, process.env.HOST, () => {
  console.log('server is listening! ip: ' + process.env.HOST + ' port: ' + process.env.PORT);
});



