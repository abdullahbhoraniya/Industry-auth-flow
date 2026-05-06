import express from 'express';
import { getMe, loginUser, logout, logoutAll, refreshtoken, registerUser, verifyEmail } from '../Controllers/auth.controller.js';

const authRouter=express.Router();


authRouter.post("/register",registerUser);
authRouter.get("/getme",getMe);
authRouter.get("/refreshtoken",refreshtoken);
authRouter.get('/logout',logout);
authRouter.post('/login',loginUser);
authRouter.get('/logout-all',logoutAll);
authRouter.post("/verify-email",verifyEmail);
export default authRouter;