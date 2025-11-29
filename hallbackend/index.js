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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection with improved error handling
mongoose.connect(process.env.mongoDb, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.error("Error code:", error.code);
    console.warn("Server will continue running, but database operations will fail");
    console.warn("Troubleshooting:");
    console.warn("1. Check your internet connection");
    console.warn("2. Verify MongoDB Atlas cluster is running");
    console.warn("3. Check if your IP is whitelisted in MongoDB Atlas");
    console.warn("4. Try: ping cluster0.6ujkutb.mongodb.net");
});
//mongodb://localhost:27017/hall_booking

app.use("/",BookingRouter);
app.use("/",LoginRouter);

const PORT = process.env.PORT || 3900;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Started at ${PORT}`);
});











