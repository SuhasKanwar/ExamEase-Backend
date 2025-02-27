const mongoose = require('mongoose');
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require('../utils/authentication');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    otp: {
        type: String,
        default: ""
    },
    otpExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;
    
    if (!user.isModified("password")) {
        return next();
    }
    
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");
    
    this.salt = salt;
    this.password = hashedPassword;
    
    next();
});

userSchema.statics.matchPassword = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if (hashedPassword !== userProvidedHash) {
        throw new Error("Invalid password");
    }

    const token = createTokenForUser(user);
    
    return token;
};

const users = mongoose.model("users", userSchema);

module.exports = users;