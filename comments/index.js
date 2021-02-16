const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors =require('cors')
const axios=require('axios');
const app = express();
app.use(bodyParser.json());
app.use(cors());
const commentsByPostID = {};

app.get("/posts/:id/comments",(req,res)=>{
    const comments=commentsByPostID[req.params.id];
    res.status(200).send(comments||[]);
})
app.post("/posts/:id/comments",async (req,res)=>{
   const commentId=randomBytes(4).toString("hex");
   const {content}=req.body;
   const comments=commentsByPostID[req.params.id] || [];
   comments.push({id:commentId,content:content});
   commentsByPostID[req.params.id]=comments;
   await axios.post('http://localhost:4005/events',{
    type:"commentCreated",
    data:{
      id:commentId,content,postId:req.params.id,status:"pending"
    }
  })
   res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
    console.log('Event Received:', req.body.type);
    const {type,data}=req.body;
    if(type==="moderationCreated"){
        const {id,postId,status,content}=data;
        const comments=commentsByPostID[postId];
        const comment=comments.find(comment=>comment.id===id)
        comment.status=status;
        await axios.post('http://localhost:4005/events',{
            type:"commentUpdated",
            data:{
                id,postId,content,status
            }
        })
    }
  
    res.send({});
  });
app.listen(4001,()=>{
    console.log("comment service is running on 4001 port")
})