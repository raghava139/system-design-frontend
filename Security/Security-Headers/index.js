const express = require('express');

const app = express();

app.get('/', (req, res, next) => {

    res.removeHeader('X-Powered-By')
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    res.send({
        id: 1,
        title: 'testing...'
    })
})

app.listen(3001, () => {
    console.log('http://localhost:' + 3001)
})