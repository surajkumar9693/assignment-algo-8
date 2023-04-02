const express = require('express')
const mongoose = require('mongoose')
const app = express()
const route = require("./routes/route") 
mongoose.set('strictQuery', true)
app.use(express.json())


mongoose.connect('mongodb+srv://surajkumar96:6i0d4EhtRtZ5xCEQ@cluster0.mqcx8wl.mongodb.net/algo-8',{
    useNewUrlParser:true
}) 
.then(()=>{
    console.log("mongoDb is connected")
})
.catch((error)=>{
    console.log(error)
})

app.use("/",route)

//----------handling wrong api edge case--------------------------------------------
app.use((req, res) => {
    res.status(400).send({ status: false, error: "Endpoint is not Correct" });
})

app.listen(3000,()=>{
    console.log(`Express is running on Port `+3000)
})







