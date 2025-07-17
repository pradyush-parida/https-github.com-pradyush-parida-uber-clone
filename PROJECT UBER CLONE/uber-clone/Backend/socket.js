const { Server } = require('socket.io');
const userModel = require('./models/user.model')
const captainModel = require('./models/captain.model')


let ioInstance = null;

function initializeSocket(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: '*', // Adjust as needed for security
            methods: ['GET', 'POST']
        }
    });
    ioInstance.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // You can add more event listeners here

        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`User with ID ${userId} and userType ${userType} joined with socket ID: ${socket.id}`);
            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id })
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id })
            }
        })

        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.lat || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });


    });
    return ioInstance;
}

const sendMessageToSocketId = (socketId, messageObject) => {

console.log(messageObject);

    if (ioInstance) {
        ioInstance.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.ioInstance not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };