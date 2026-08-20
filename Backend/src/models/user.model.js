const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:[true,"Username must be unique"]
    },
    email:{
        type:String,
        required:[true,"Email must be required"],
        unique:[true,"Email must be unique"]
    },
    password:{
         type:String,
        required:[true,"password must be required"],
        select:[false]
    }
})

const userModel = mongoose.model("users",userSchema);

module.exports = userModel

//Task 
//userSchema.pre("save",function(next)){})
//userSchema.post("save",function(next)){})