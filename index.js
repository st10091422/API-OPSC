const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT|| 3000
const urlprefix = '/api/v1'

app.use(express.json());

const userRoute = require('./routes/userRoutes');
const transactionRoute = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const expenseRoute = require('./routes/expenseRoutes');



app.use(`${urlprefix}/user/`, userRoute);
app.use(`${urlprefix}/transaction/`, expenseRoute);
app.use(`${urlprefix}/transaction-all/`, transactionRoute);
app.use(`${urlprefix}/category/`, categoryRoutes);


app.listen(PORT, () =>{
    console.log(`backend server is running at localhost:${PORT}`);
}); 