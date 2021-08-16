const express = require('express');
require('./db/mongoose')


const cors = require('cors')
const app = express();
app.use(cors({origin:true}))
const port = process.env.PORT 

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

const UserRouter = require('./routers/user');
app.use(UserRouter);

const TaskRouter = require('./routers/task');
app.use(TaskRouter);

const jwt = require('jsonwebtoken');


app.listen(port, () => {
    console.log('Server listening on port'+port);
})