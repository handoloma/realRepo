import express from 'express';
import {getAllWorker, createWorker, getWorkerSingle, addWorker, deleteWorker} from '../controllers/workerController.js'
import singleUpload from '../middleware/multer.js';
import {authorizeAdmin, isAuthenticatedUser} from '../middleware/auth.js'

const router = express.Router();

router.route('/workers').get(getAllWorker);
router.route('/createworker').post(isAuthenticatedUser, authorizeAdmin, singleUpload, createWorker);
router.route('/worker/:id').get(isAuthenticatedUser, getWorkerSingle).post(isAuthenticatedUser, authorizeAdmin, singleUpload, addWorker).delete(isAuthenticatedUser, authorizeAdmin, deleteWorker);

export default router;