import express from "express";
import {bySubscription, paymentVarification, getRazorpayKey} from '../controllers/paymentController.js'
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.route('/subscribe').get(isAuthenticatedUser, bySubscription)
router.route('/paymentvarification').post(isAuthenticatedUser, paymentVarification)
router.route('/razorpaykey').get(isAuthenticatedUser, getRazorpayKey);
// router.route('/subscribe/cancle').delete(isAuthenticatedUser, cancleSubscription)

export default router