import express from 'express';
import connectDb from './lib/connectDb.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
const app=express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);

app.listen(5000,async()=>{
    await connectDb();
    console.log("Server running on port 5000");
})