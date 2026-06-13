import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Configure DNS servers to avoid querySrv ECONNREFUSED on some network configurations
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Atlas Connected');
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
