const express = require('express');

const app = express();

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'nonce-random-key' 'unsafe-inline' https://fakestoreapi.com;  img-src 'self' https://media.istockphoto.com;`
    ),
    // res.setHeader(
    //     'Content-Security-Policy-Report-Only',
    //     "default-src 'self'; script-src 'self'; report-to csp-endpoint;"
    // );
    next();
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.listen(3000, () => {
    console.log(`Server Started at http://localhost:${3000}`)
})