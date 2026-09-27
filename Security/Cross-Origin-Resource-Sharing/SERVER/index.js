const express = require('express');
const cors = require('cors');

const app = express();
const allowedOrigins = ['http://127.0.0.1:5500']
const corsOptions = {
    origin: function (origin, callback) {
        console.log(origin);

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("CORS ERROR"));
        }
    },

    methods: [
        "PATCH"
    ]
};
app.use(cors(corsOptions))

app.get('/data', (req, res) => {
    res.send([
        {
            id: "1",
            fullName: "raghavendra"
        }
    ])
})
app.listen('5023', () => {
    console.log(`http://localhost:${5023}`)
})