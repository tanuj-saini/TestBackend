import mongoose,{ Mongoose  } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Mongoose.Schema({
    watchHistory: [
    
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        

    ],
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
        lowercase: true,

    },
    
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
   
    avatar: {
        type: String,//clodinary url
        required: true,
       
    },
    coverImage: {
        type: String,
        required: true,
       
    },
    password: {
        type: String,
        required: [true,"Password is required"],
       
    },
    refreshToken: {
        type: String,
        
    }
   
   

} ,{
    timestamps: true
});

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});
userSchema.methods.comparePassword = async function( password) {
    return await bcrypt.compare( password,this.password);
};
userSchema.methods.generateToken = function() {
    return jwt.sign({_id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    }, process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
        }
        );
};
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({_id: this._id,
       
    }, process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        }
        );
};
export const User = Mongoose.model("User", userSchema);