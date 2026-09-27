const express = require('express');

const app = express();

const port = 5010;

app.get('/example1',(req,res,next)=>{
    res.sendFile(__dirname + '/example1.html')
})
app.get('/example2',(req,res,next)=>{
    res.sendFile(__dirname + '/example2.html')
})
app.get('/example3',(req,res,next)=>{
    res.sendFile(__dirname + '/example3.html')
})
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})