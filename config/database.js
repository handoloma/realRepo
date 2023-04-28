import mongoose from "mongoose";

export const connectDB = async() =>{
   const {connection} = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false
   });

   console.log(`mongoDB connected with ${connection.host}`)
}