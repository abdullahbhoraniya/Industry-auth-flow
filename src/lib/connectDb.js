import mongoose from "mongoose";
import config from "./config.js";


const connectDb=async()=>{
    try {
        const connection=await mongoose.connect(config.mongodbUri);
        if(connection){
            console.log("Connected to MongoDb")
        }
    } catch (error) {
        console.error("Error connecting to MongoDb",error);
    }
}


export default connectDb;