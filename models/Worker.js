import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please enter your name'],
        trim: true,
        maxLength: [15, 'name cannont excede to 15 character']
    },
    location:{
        type: String,
        required: [true, 'please enter your location'],
        trim: true,
    },
    ratings:{
        type: Number,
        default: 0
    },
    poster:[{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    }],
    category:{
        type: String,
        required: [true, 'please enter category of your work'],
        enum:{
            values:[
                'plumber',
                'electrician',
                'labour',
                'carpainter',
                'testing',
            
            ],
            message: 'please enter the correct category'
        }
    },
    numOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[{
        // user:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true
        // },
        name:{
            type:String,
            required: true
        },
        rating:{
            type:Number,
            required: true
        },
        comment:{
            type:String,
            required: true
        }
    }],
    lecture:[
        {
            name:{
                type: String,
                required: true
            },
            video:{
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            }
            }
        }
    ],
    numOfVideos:{
        type: Number,
        default: 0
    },
    // user:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

export const Worker = mongoose.model('Worker', schema);