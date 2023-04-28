import {catchAsyncError} from '../middleware/catchAsyncError.js';
import ErrorHandler from '../utiles/errorHandlers.js'
import {User} from '../models/User.js'
import { Worker } from '../models/Worker.js';
import sendToken from '../utiles/sendToken.js'
import {sendEmail} from '../utiles/sendEmail.js';
import crypto from 'crypto'
import cloudinary from 'cloudinary';
import getDataUri from '../utiles/dataUri.js'

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const file = req.file;

    if(!name || !email || !password || !file)
    return next(new ErrorHandler('please enter all fields', 400));

    let user = await User.findOne({email});

    if(user) return next(new ErrorHandler('user alredy exist', 409));

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    });

    sendToken(res, user, "register sucessfully", 201)


});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //checks if password and email is entred by user
    if (!email || !password) {
        return next(new ErrorHandler('please enter email and password', 400))
    }

    //finding user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('user does not exist', 401))
    }

    //check if password is correct or not
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return next(new ErrorHandler('incorrect email or password', 401))
    }

    sendToken(res, user, `welcome back ${user.name}`, 201);

});

export const logout = catchAsyncError(async (req, res, next) => {

    res.status(200).cookie('token', null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: 'Logged out'
    })
});

export const getmyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user
    })
});

export const changePassword = catchAsyncError(async (req, res, next) => {
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword)
        return next(new ErrorHandler('please enter all field', 400))

    const user = await User.findById(req.user._id).select('+password');

    const isMatchPassword = await user.comparePassword(oldPassword);

    if (!isMatchPassword) {
        return next(new ErrorHandler('old password is incorrect', 400))
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'password changed sucessfully'
    })
});

export const updateProfile = catchAsyncError(async (req, res, next) => {

    const {name, email}  = req.body

    const user = await User.findById(req.user._id)

    if(name) user.name = name
    if(email) user.email = email

    await user.save();
   
    res.status(200).json({
        success: true,
        message: 'profile updated successfully'
    })
})

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    const file = req.file;

    const user = await User.findById(req.user._id)

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar ={
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }

    await user.save()

    res.status(200).json({
        success: true,
        message: 'profile picture updated successfully'
    })
})

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const {email} = req.body

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler('user not found with this email account', 400));
    }

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message = `click on the link to rest password ${url} if you not requeted then please ignore`

    await sendEmail(user.email, "Homiees reset password", message);

    res.status(200).json({
        success: true,
        message: `reset token send to ${user.email} sucessfully`
    })

});

export const resetPassword = catchAsyncError(async (req, res, next) => {

    const {token} = req.params

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('password token is invalid or expires', 400))
    }

    user.password = req.body.password

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: `password change sucessfully`
    })

});

// export const addToSave = catchAsyncError(async(req, res, next) =>{
//     const user = await User.findById(req.user._id);

//     const worker = await Worker.findById(req.body.id);

//     if(!worker) return next('invalid worker id', 404);

//     const itemExist = user.playlist.find((item)=>{
//         if(item.worker.toString() === worker._id.toString()) return true
//     })

//     if(itemExist) return next(new ErrorHandler('worker already been saved', 409))

//     user.playlist.push({
//         worker: worker._id,
//         poster: worker.poster.url
//     });

//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: 'worker has been saved'
//     })
// });

// export const removeFromSave = catchAsyncError(async(req, res, next) =>{
//     const user = await User.findById(req.user._id);

//     const worker = await Worker.findById(req.query.id);

//     if(!worker) return next(new ErrorHandler('invalid worker id'), 404);

//     const newSave = user.playlist.filter(item =>{
//         if(item.worker.toString() !== worker._id.toString()) return item
//     })

//     user.playlist = newSave;
//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: 'worker has been remove from your save gallary'
//     })
// });
export const allUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find({});

    res.status(200).json({
        success: true,
        users
    })
});
export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler('user not found', 404));

    if(user.role === 'user') user.role = 'admin';
    else user.role = 'user';

    await user.save()

    res.status(200).json({
        success: true,
        message: 'user role updated sucessfully'
    })
});
export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler('user not found', 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    

    //remove avtar from cloudnery
    await user.remove();

    res.status(200).json({
        success: true,
        message: 'user deleted sucessfully'
    })
});
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    

    //remove avtar from cloudnery
    await user.remove();

    res.status(200).cookie('token', null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: 'user profile deleted sucessfully'
    })
});