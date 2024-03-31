import mongoose from "mongoose";

const userName = process.env.DB_USER_NAME;
const password = encodeURIComponent(process.env.DB_PASSWORD);
const databaseName = process.env.DB_NAME;
const databaseHost = process.env.DB_HOST;

const dbURL = `mongodb+srv://${userName}:${password}@${databaseHost}/${databaseName}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("DB connection established.");
  } catch (error) {
    console.log("DB connection failed.");
    console.log(error.message);
  }
};

export default connectDB;
