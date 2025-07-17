const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const express = require('express');
const app = express();
const connectDB = require('./db/connectDB')
const userRoutes = require('./routes/user.routes')
const cookieParser = require('cookie-parser')
const captainRoutes = require('./routes/captain.routes')
const mapsRoutes = require('./routes/maps.routes')
const rideRoutes = require('./routes/ride.routes')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

connectDB();

app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.use('/user',userRoutes);
app.use('/captain',captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/ride', rideRoutes);

module.exports = app;