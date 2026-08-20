import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json())

app.all('/', (req, res) => {

    res.send('connection alive getting')
})

const port = 5123;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})

const todo = [
    {
        id: "1",
        title: "task1",
        status: "pending"
    },
    {
        id: "2",
        title: "task2",
        status: "completed"
    }
]

//get Method
app.get('/todo', (req, res) => {
    res.send(todo)
})

//post method
app.post("/todo",(req,res)=>{
    const reqBody = req.body;
    todo.push(reqBody);
    res.status(201)
    res.json({
        message:'created successfully'
    })
})

//put method
app.put("/todo/:id",(req,res)=>{
    const reqestedID = req.params.id;
    const updateTodo = todo.findIndex((data)=> data.id === reqestedID);
    if(updateTodo !== -1){
        todo[updateTodo] = {...req.body}
    }
    res.status(200)
    res.json({
        message:'updated successfully'
    })
})

// Delete method 
app.delete('/todo/:id',(req,res)=>{
    const reqID = req.params.id;
    const deleteTodo = todo.findIndex((data)=> data.id === reqID);
    todo.splice(deleteTodo,1);
    res.status(204);
})