const mongoose = require('mongoose');
const dontenv = require('dotenv');
const path = require('path')

dontenv.config({path : path.resolve(__dirname, '..', '.env')})

const DB_URI = process.env.DB_URI;

const connectDB = async () => {
    if (DB_URI===undefined) {
        console.log('Database Uri is required');
    };

    try {
        mongoose.connect(DB_URI);
        console.log('db connected');  
    } catch (error) {
        console.log('error while connecting with database : ', error.message);
    }
};


mongoose.connection.on('error', ()=>{
    setTimeout(() => {
        connectDB();
    }, 3000);
});



const closeDbConnection = async () => {
    try {
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.log('error while shuting db connection : ', error);
    }
};


process.on('SIGTERM', closeDbConnection);
process.on('SIGINT', closeDbConnection);

connectDB();