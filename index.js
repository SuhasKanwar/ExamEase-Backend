const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => { console.log('Connected to MongoDB!!!') })
    .catch(err => { console.error('Could not connect to MongoDB', err) });

const app = express();
const PORT = 9000;

app.use(cors());

const { logger } = require('./middlewares/logs');
const { checkAuthCookie } = require('./middlewares/authentication');

app.use(logger("log.txt"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));

const userRouter = require('./routes/user');

app.get('/', (req, res) => {
    res.send('Server has started successfully !!!');
});
app.use('/user', userRouter);

app.listen(PORT, (error) => {
    if(error){
        console.log("Error connecting with server", error);
    }
    else{
        console.log(`Server is listening on port -> ${PORT}`);
        console.log(`\n\nhttp://localhost:${PORT}\n\n`);
    }
});