const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')

app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    //send each user to a specific room ID when app is first opened
    res.redirect(`/ ${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        //join a room
        socket.join(roomId)
        //    broadcast a message to everyone in the room that a new user has joined.
        socket.to(roomId).broadcast.emit('user-connected', userId)
        //listen for text message
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })

        //checking for an event 'user-disconnected' when someone leaves, send it to script.js
        socket.on('disconnect', () =>{
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)



