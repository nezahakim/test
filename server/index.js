import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'


const app = express()
const server = createServer(app)

const io = new Server(server,{
    cors:{
        origin: ['https://test-gilt-nine-90.vercel.app','http://localhost:5173'],
        methods: ["GET", "POST"],
        allowedHeaders: ["*"]
    },
    transports: ["websocket"]
})

io.on('connection', (socket)=>{

    io.use((socket, next)=>{
        const auth = socket.auth;

        if(!auth.userId){
            console.error('Unathorized ID')
        }

        socket.id = auth.userId;
        next()
    })

    socket.on('join-chat', (room)=>{
        socket.join(room)

        console.log('Userjoined with id: '+ socket.id)

        socket.to(room).emit('chat-joined', socket.id)
    })

    socket.on('send-message', (message, room)=>{
        console.log(message)
        io.in(room).emit('new-message', message)
    })

    socket.on('typing', (room)=>{
        socket.to(room).emit('typing')
    })

    socket.on('disconnect', (error)=>{
        console.log('user disconnected with id: ' + socket.id)
        console.log("Reason: " + error)
    })
})


server.listen(3000, ()=>{
    console.log('> app running on http://localhost:3000')
})

