const express = require('express');

const app = express();

const port = 5011;

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'")
    res.cookie('sessionID','12345',{
        httpOnly:true,
        sameSite:true,
        secure:true 
    })
    next();
})
app.get('/iframe-website1', (req, res, next) => {
    res.sendFile(__dirname + '/iframe-website1.html')
})
app.get('/iframe-website2', (req, res, next) => {
    res.sendFile(__dirname + '/iframe-website2.html')
})
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})