import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const schema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please enter your name'],
        maxLenght: [30, 'length cannot exceded above 30 character']
    },
    email:{
        type: String,
        required: [true, 'please enter email'],
        unique: true,
        validate: [validator.isEmail, 'please enter valid email address']
    },
    password:{
        type: String,
        required: [true, 'please enter your password'],
        minLength: [6, 'password lenght should be greter than 6 character'],
        select: false
    },
    role:{
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    subscription:{
        id: String,
        status: String
    },
    avatar:{
        public_id:{
            type:String,
            required: true
        },
        url:{
            type:String,
            required: true
        }
    },
    playlist:[
        {
            worker:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Worker',
            poster: String
            }
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

schema.pre('save', async function (next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

schema.methods.getJwtToken = function(){
    return jwt.sign({_id: this._id}, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });
}

schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}
schema.methods.getResetToken = function(){

    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hash and to resetpasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set Token expires time
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    return resetToken
}

export const User = mongoose.model('User', schema);