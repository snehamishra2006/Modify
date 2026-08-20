const Redis = require("ioredis").default

const redis = new Redis({
    host:process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
})

redis.on("connect",()=>{  
    console.log("Server is connected to redis")
})   

// redis.on = jaise hi reddis connect ho jaye server se log karwa do
redis.on("error",(err)=>{
    console.log(err)
})

module.exports = redis
   