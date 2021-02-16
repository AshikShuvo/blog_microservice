const express = require("express");
const bodyParser=require('body-parser');
const cors=require('cors');
const axios= require("axios");
const app=express();
app.use(bodyParser.json());
app.use(cors());

app.post('/events',async (req,res)=>{
    const {type,data}=req.body;
    if(type==='commentCreated'){
        const {id,content,postId,status}=data;
        const newStatus=content.includes('orange')?'rejected':"approved";
        await axios.post("http://localhost:4005/events",{
            type:"moderationCreated",
            data:{
                id,content,postId,status:newStatus
            }
        })
        
    }
})

app.listen(4003,()=>{
    console.log("moderation service running on 4003")
})