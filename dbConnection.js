import mongoose from "mongoose";
import dotenv from  "dotenv"

dotenv.config({ path: "./config.env"})
export const dbconnection = () =>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName: "RQ_Analytics"
    }).then(()=>{
        console.log("Sucessfully Connected  to database ")
    }).catch((err)=>{
        console.log("Failed to connect to db",err)
    })
}