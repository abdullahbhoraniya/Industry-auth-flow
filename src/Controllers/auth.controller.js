
import userModel from "../Models/user.model.js";
import crypto, { verify } from "crypto";
import jwt from "jsonwebtoken";
import config from "../lib/config.js";
import sessionModel from "../Models/session.model.js";
import { generateOTP, generateOtpHtml ,successEmailHtml} from "../../utils/otp.js";
import otpModel from "../Models/otp.model.js";
import { sendEmail, SuccessEmail } from "../../service/email.js";


export const registerUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await userModel.findOne({
            $or: [
                { email },
                { userName }
            ]
        })

        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const passwordHashed = await crypto.createHash("sha256").update(password).digest("hex");


        const newUser = await userModel.create({
            userName: userName,
            email: email,
            password: passwordHashed
        })

        const otp = generateOTP();
        const GenerateotpHtml = generateOtpHtml(otp);

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        await otpModel.create({
            email: email,
            userId: newUser._id,
            otpHash: otpHash
        })

        await sendEmail(email, "Email Verification", `Your OTP for email verification is ${otp}`, GenerateotpHtml);

        res.status(201).json({
            message: "user registered successfully",
            user: {
                Name: newUser.userName,
                userEmail: newUser.email
            }
        })
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const refreshtoken = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(404).json({ message: "Refresh token not found" });
        }

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash: refreshTokenHash,
            revoked: false
        })

        if (!session) {
            return res.status(404).json({
                message: "Session not found or the session is been revoked"
            })
        }

        const decoded = jwt.verify(refreshToken, config.jwtSecret);

        const userId = decoded.id;

        const newAccessToken = jwt.sign({
            id: userId
        },
            config.jwtSecret, {
            expiresIn: "15m"
        })
        const newRefreshToken = jwt.sign({
            id: userId
        }, config.jwtSecret, {
            expiresIn: "7d"
        })

        const newrefreshtokenhash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        session.newRefreshToken = newrefreshtokenhash;
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Access token refreshed successfully",
            token: newAccessToken
        })
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export const getMe = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "unauthorized" });
        }

        const decoded = jwt.verify(token, config.jwtSecret);

        const userId = decoded.id;
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                userName: user.userName,
                email: user.email
            }
        })
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

//Login 
export const loginUser = async (req, res) => {
    try {
        console.log("Login request body", req.body);
        const { email, password } = req.body;

        const user = await userModel.findOne({
            email: email
        })

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        if (!user.verified) {
            return res.status(401).json({
                message: "Please verify your email before logging in"
            })
        }
        const passwordHashed = await crypto.createHash("sha256").update(password).digest("hex");

        const isPasswordMatch = passwordHashed === user.password;

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "invalid credentials"
            })
        }

        const refreshToken = jwt.sign({
            id: user._id
        }, config.jwtSecret, {
            expiresIn: "7d"
        })

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        await sessionModel.create({
            userId: user._id,
            refreshTokenHash: refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        })
        const accessToken = jwt.sign({
            id: user._id
        }, config.jwtSecret, {
            expiresIn: "15m"
        })


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                userName: user.userName,
                email: user.email
            },
            token: accessToken
        })
    }
    catch (error) {
        console.error("Error logging in user", error);
    }
}

// logout from all device
export const logoutAll = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(404).json({ message: "Refresh token not found" });
        }

        const decoded = jwt.verify(refreshToken, config.jwtSecret);

        await sessionModel.updateMany({
            userId: decoded.id,
            revoked: false
        }, {
            revoked: true
        })

        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logged out from all devices successfully" });
    } catch (error) {
        return res.status(401).json({ message: "Something went wrong while logging out" });
    }
}

//logout from single devices
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log("refreshToken", refreshToken);
        if (!refreshToken) {
            return res.status(404).json({ message: "Refresh token not found" });
        }

        const refreshTokenhash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        console.log("refrshToken", refreshTokenhash);
        const session = await sessionModel.findOne({
            refreshTokenHash: refreshTokenhash,
            revoked: false
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        session.revoked = true;
        await session.save();

        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        return res.status(401).json({ message: "Something went wrong while logging out" });
    }
}


export const verifyEmail = async (req, res) => {
    try {

        const { email, otp } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        if (!otp) {
            return res.status(400).json({
                message: "OTP is required"
            });
        }

        // Hash entered OTP
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // Find OTP record
        const otpRecord = await otpModel.findOne({
            email: email,
            otpHash: otpHash
        });

        // Proper OTP checking
        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Optional: Check OTP expiry
        if (otpRecord.expiresAt < new Date()) {

            // Delete expired OTP
            await otpModel.findByIdAndDelete(otpRecord._id);

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // Update user verification status
        const userUpdateStatus = await userModel.findOneAndUpdate(
            {
                _id: otpRecord.userId,
                email: email
            },
            {
                verified: true
            },
            {
                returnDocument: 'after'
            }
        );

        // Check if user exists
        if (!userUpdateStatus) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Delete OTP after successful verification
        await otpModel.findByIdAndDelete(otpRecord._id);

        // Success email template
        const successEmailTemplate = successEmailHtml();

        // Send success email
        await SuccessEmail(
            email,
            "Email Verification Successful",
            "Your email has been verified successfully",
            successEmailTemplate
        );

        // Success response
        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                userName: userUpdateStatus.userName,
                email: userUpdateStatus.email,
                verified: userUpdateStatus.verified
            }
        });

    } catch (error) {

        console.error("Error verifying email:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};