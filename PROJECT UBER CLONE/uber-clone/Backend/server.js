const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const { initializeSocket } = require('./socket');


const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initializeSocket(server);

server.listen(port,()=>{console.log(`Server Running on port ${port}`)});