const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist.model")
const redis = require("../config/cache")

async function registerUser(req,res){

    const{username,email,password}=req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    })
     
    if(isAlreadyRegistered){
        return res.status(400).json({
            message:"User already exist"
        })
    }

    //hash password
    const hash = await bcrypt.hash(password,10)

    // create
    const user = await userModel.create({
        username,email,password:hash
    })

    // create tokent
    const token = jwt.sign({
        id: user._id,
        email: user.email
    },process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)
    return res.status(201).json({
        message:"User registered Sucessfully",
        user:{
            id: user._id,
            username:user.username,
            email:user.email
        }
    })
    
}
    


async function loginUser(req,res){
    
    const{email,password,username}=req.body;
    const user = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    }).select("+password")
    if(!user){
        return res.status(400).json({
            message:"Invalid credentials" 
       // why we are usin invalid credential instead of user ot found
        })
    }
     
    const isPasswordValid = await bcrypt.compare(password,user.password)
    
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }
       // create tokent
    const token = jwt.sign({
        id: user._id,
        email: user.email
    },process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)
    return res.status(201).json({
        message:"User login sucessfully",
        user:{
            id: user._id,
            username:user.username,
            email:user.email
        }
    })

}   



// find user details
async function getMe(req,res){
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message:"User fetched successfully",
        user
    })
}
     

async function logoutUser(req,res){

    const token = req.cookies.token
    
    // for mongoDB
    // await blacklistModel.create({
    //     token
    // })

    await redis.set(token,Date.now().toString())
    // redis store data in

    res.status(201).json({
        messgae:"logout sucessfully"
    })
}


module.exports ={
    registerUser,
    loginUser,
    getMe,
    logoutUser
}
 