import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected',() => {
        console.log("connection establised");
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/playeractive`);
}

export default connectDB;