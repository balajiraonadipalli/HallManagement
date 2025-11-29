
const jwt =  require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req,res,next)=>{
    let token;
    
    // Check if authorization header exists
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            
            // Verify JWT token
            const decoded = jwt.verify(token,"Balaji");
            console.log("Decoded token:", decoded);
            
            // Check MongoDB connection
            const mongoose = require("mongoose");
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({ 
                    message: "Database connection unavailable. Please try again later." 
                });
            }
            
            // Find user in database
            req.user = await User.findById(decoded.id).select("-password");
            console.log("User found:", req.user);
            
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }
            
            next();
        } catch (error) {
            console.error("Protect middleware error:", error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({message:"Invalid token"});
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({message:"Token expired. Please login again"});
            } else {
                return res.status(401).json({message:"Not Authorized: " + error.message});
            }
        }
    } else {
        // No token provided
        return res.status(401).json({message:"Not Authorized: Token not found"});
    }
}

module.exports = {protect};