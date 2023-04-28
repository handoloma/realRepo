import {User} from '../models/User.js'
import jwt from 'jsonwebtoken'
import ErrorHandler from '../utiles/errorHandlers.js';
import {catchAsyncError} from './catchAsyncError.js'

//checks if user is autheticated or not
export const isAuthenticatedUser = catchAsyncError(async(req, res, next) => {
    const { token } = req.cookies

    if(!token){
        return next(new ErrorHandler('login first to acess this resourse', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);

    next();
});

// //handling user role
export const authorizeAdmin = (req, res, next) =>{
        if(req.user.role !='admin')
            return next(
            new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resoures`,403));

        next();
    
}