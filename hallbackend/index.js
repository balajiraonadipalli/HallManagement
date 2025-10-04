const express = require("express");
const mongoose = require("mongoose");
const BookingModel = require("./models/BookingModel");
const Department = require("./models/DepartmentModel");
const Hall = require("./models/HallModel");
const BookingRouter = require("./routers/BookingRouter")
const cors = require("cors");
const { LoginRouter } = require("./routers/LoginRouter");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        'https://hall-management-sandy.vercel.app', // Your Vercel frontend
        'http://localhost:3000' // Local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Or simpler - allow all origins (for testing):
app.use(cors()); // This allows all domains

mongoose.connect(process.env.mongoDb)
.then(() =>{
    console.log("MongoDb cconnected");
});
//mongodb://localhost:27017/hall_booking

app.use("/",BookingRouter);
app.use("/",LoginRouter);

app.listen(process.env.PORT,'0.0.0.0',console.log("Server Started at 3900"));











