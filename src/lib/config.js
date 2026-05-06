import dotenv from "dotenv";


dotenv.config();


if(!process.env.MONGO_URL){
    throw new Error("MONGO_URL is not defined in .env file");
}
if(!process.env.jwt_secret){
    throw new Error("jwt_secret is not defined in .env file");
}
if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in .env file");
}
if(!process.env.GOOGLE_SECRET_KEY){
    throw new Error("GOOGLE_SECRET_KEY is not defined in .env file");
}
if(!process.env.GOOGLE_REFRESH_TOKEN){  
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in .env file");
}
if(!process.env.GOOGLE_USER){
    throw new Error("GOOGLE_USER is not defined in .env file");
}

const config={
    mongodbUri:process.env.MONGO_URL,
    jwtSecret:process.env.jwt_secret,
    googleClient:process.env.GOOGLE_CLIENT_ID,
    googleSecret:process.env.GOOGLE_SECRET_KEY,
    googleRefreshToken:process.env.GOOGLE_REFRESH_TOKEN,
    emailuser:process.env.GOOGLE_USER
}

export default config;