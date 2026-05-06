import mongoose from "mongoose";


const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"User ID is required"]
    },
    otpHash:{
        type:String,
        required:true
    },

},{timestamps:true});


const otpModel=mongoose.model("Otp",otpSchema);

export default otpModel;