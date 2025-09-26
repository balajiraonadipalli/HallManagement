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
    origin: ["http://localhost:3000", "http://192.168.31.169","*"],
    methods:["POST","GET","PUT","PATCH","DELETE"],
    credentials:true
}));
mongoose.connect(process.env.mongoDb)
.then(() =>{
    console.log("MongoDb cconnected");
});
//mongodb://localhost:27017/hall_booking

app.use("/",BookingRouter);
app.use("/",LoginRouter);

app.listen(process.env.PORT,'0.0.0.0',console.log("Server Started at 3900"));











