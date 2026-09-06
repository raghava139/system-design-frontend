const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
let data = 'initial data'
let waitingList = [];

app.get('/getData', (req, res) => {
    if (data !== req.query.data) {
        res.send({ data })
    } else {
        waitingList.push(res)
    }
})


app.get('/updatedData', (req, res) => {
    data = req.query.data;

    while (waitingList.length > 0) {
        const client = waitingList.pop();
        client.json({ data });
    }
    res.send({ success: "Data Updated Successfully" })
})

app.listen(5000, () => {
    console.log(`http://localhost:5000`)
})