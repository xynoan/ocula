require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

let otpStore = {};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    console.log("Stored OTP:", otpStore[email]);
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your One-Time Password (OTP) for Account Verification",
        text: `
    Dear User,
    
    Your one-time password (OTP) for account verification is: **${otp}**
    
    This OTP is valid for the next **5 minutes**. Please do not share this code with anyone for security reasons.
    
    If you did not request this OTP, please ignore this email.
    
    Best regards,  
    Ocula Team
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    console.log("Verifying OTP for:", email);
    console.log("Received OTP:", otp);

    if (!otpStore[email]) {
        return res.status(400).json({ success: false, message: "OTP expired or not found." });
    }

    if (otpStore[email].toString() === otp) {
        delete otpStore[email];
        res.json({ success: true, message: "OTP verified!" });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP. Try again." });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
