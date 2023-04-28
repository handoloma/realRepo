import { catchAsyncError } from '../middleware/catchAsyncError.js'
import {Worker} from '../models/Worker.js'
import getDataUri from '../utiles/dataUri.js';
import ErrorHandler from '../utiles/errorHandlers.js';
import cloudinary from 'cloudinary';

export const getAllWorker = catchAsyncError(
    async(req, res, next) => {

        const workers = await Worker.find().select("-lecture");
    
        res.status(200).json({
            success: true,
            workers
        });
    }
)

export const createWorker = catchAsyncError(async (req, res, next)=>{

    const {name, location, category} = req.body;

    if(!name || !location || !category) return next(new ErrorHandler('please enter all field', 400));

    const file = req.file;


    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

    await Worker.create({
        name, location, category,
        poster:{
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    });

    res.status(201).json({
        success: true,
        message: 'worker created sucessfully'
    })
});


export const getWorkerSingle = catchAsyncError(async(req, res, next) =>{
    const worker = await Worker.findById(req.params.id);

    if(!worker) return next(new ErrorHandler('worker not found', 404));

    await worker.save();
    
        res.status(200).json({
            success: true,
            worker
        });
});

export const addWorker = catchAsyncError(async (req, res, next)=>{
    const {id} = req.params
    const {name} = req.body;

    const worker = await Worker.findById(id);

    if(!worker) return next(new ErrorHandler('worker not found', 404))

    const file = req.file;

    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: 'video'
    })

    worker.lecture.push({
        name,
        video:{
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    });

    worker.numOfVideos = worker.lecture.length

    await worker.save()

    res.status(201).json({
        success: true,
        message: 'worker added sucessfully'
    })
});

export const deleteWorker = catchAsyncError(async (req, res, next)=>{
    const {id} = req.params

    const worker = await Worker.findById(id);

    if(!worker) return next(new ErrorHandler('worker not found', 404))

    await cloudinary.v2.uploader.destroy(worker.poster.public_id);

    for (let i = 0; i < worker.lecture.length; i++) {
        const singleLecture = worker.lecture[i];

        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
            resource_type: 'video'
        })
        
    }

    await worker.remove()

    res.status(201).json({
        success: true,
        message: 'worker deleted sucessfully'
    })
});