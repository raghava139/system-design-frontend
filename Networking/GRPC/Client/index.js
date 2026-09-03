const express = require('express');
const bodyParser = require('body-parser');
const client = require('./client');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    client.getAll(null, (err, data) => {
        if (!err) {
            res.send(data)
        }
    })
})

app.post('/create', (req, res) => {
    let newCustomer = {
        name: req.body.name,
        age: req.body.age,
        address: req.body.address
    }
    client.insert(newCustomer, (err, data) => {
        if (err) throw err;
        console.log(err)
        res.send({
            message: "Customer Created Successfully"
        })
    })
})

app.put('/update', (req, res) => {
    const updateCustomer = {
        id: req.body.id,
        name: req.body.name,
        age: req.body.age,
        address: req.body.address
    }
    client.update(updateCustomer, (err, data) => {
        if (err) throw err;
        res.send({
            message: "Customer update Successfully"
        })
    })
})

app.delete('/remove', (req, res) => {
    client.remove({ id: req.body.customer_id }, (err, _) => {
        if (err) throw err;

        res.send({ message: "Customer Removed Successfully" });
    })
})

const port = 3000;

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})