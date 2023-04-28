import express from 'express';
import {register, login, logout, getmyProfile, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword, allUsers, updateUserRole, deleteUser, deleteMyProfile} from '../controllers/userController.js';
import {authorizeAdmin, isAuthenticatedUser} from '../middleware/auth.js';
import singleUpload from '../middleware/multer.js'

const router = express.Router();

router.route('/register').post(singleUpload, register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/changepassword').put(isAuthenticatedUser, changePassword);
router.route('/updateprofile').put(isAuthenticatedUser, updateProfile);
router.route('/updateprofilepicture').put(singleUpload, isAuthenticatedUser, updateProfilePicture);
router.route('/forgetpassword').post(forgetPassword);
router.route('/resetpassword/:token').put(resetPassword);
// router.route('/addtosave').post(isAuthenticatedUser, addToSave);
// router.route('/removefromsave').delete(isAuthenticatedUser, removeFromSave);
router.route('/admin/users').get(isAuthenticatedUser, authorizeAdmin, allUsers);
router.route('/admin/user/:id').put(isAuthenticatedUser, authorizeAdmin, updateUserRole).delete(isAuthenticatedUser, authorizeAdmin, deleteUser);
router.route('/me').get(isAuthenticatedUser, getmyProfile).delete(isAuthenticatedUser, deleteMyProfile);


export default router;