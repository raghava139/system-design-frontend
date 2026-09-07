const express = require('express');
const { join } = require('node:path');

const app = express();


app.get("/", (req, res) => {
    res.sendFile(join(__dirname, '/index.html'))
})


app.get('/events', (req, res) => {
    res.setHeader('Content-Type', "text/event-stream");
    res.setHeader('Cache-Control', "no-cache");
    res.setHeader('Connection', "keep-alive");

    //send Event 
    res.write("data:Hello \n\n");

    //send Another Event after 2 seconds

    setTimeout(() => {
        res.write("data: How are you ? \n\n");
    }, 2000)

    // another Event 
    setTimeout(() => {
        res.write("data: new Notification! \n\n");
    }, 5000);
})

app.listen(3000, () => {
    console.log(`http://localhost:${3000}`)
})