const express = require('express');

const app = express();


app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
})

let data = 'Initial Data';
app.get('/get-data',(req,res)=>{
    res.send({
        data
    })
})
app.get('/update-data',(req,res)=>{
    data = 'Updated Data'
    res.send({
         data
    })
})
const port = 5000;

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})
