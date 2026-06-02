const mongoose = require('mongoose');

const uri = "mongodb://henglongmondb1:longmndb1@ac-r7f1kdi-shard-00-00.4l7nnwx.mongodb.net:27017,ac-r7f1kdi-shard-00-01.4l7nnwx.mongodb.net:27017,ac-r7f1kdi-shard-00-02.4l7nnwx.mongodb.net:27017/auth_db?ssl=true&replicaSet=atlas-7c3hst-shard-0&authSource=admin&appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// 1. Wrap the connection code inside a function
const connectDB = () => {
  mongoose.connect(uri, clientOptions)
    .then(() => {
      console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
    })
    .catch(err => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};

// 2. Export the FUNCTION so index.js can call it using connectDB()
module.exports = connectDB;