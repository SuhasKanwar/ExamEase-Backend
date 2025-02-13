const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => { console.log('Connected to MongoDB!!!') })
    .catch(err => { console.error('Could not connect to MongoDB', err) });

const app = express();
const PORT = 9000;

const { logReqRes } = require('./middlewares/logs');
const { checkAuthCookie } = require('./middlewares/authentication');

app.use(logReqRes("log.txt"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));

app.get('/', (req, res) => {
    res.send('Server has started successfully !!!');
});

const userRouter = require('./routes/user');
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`\n\nhttp://localhost:${PORT}\n\n`);
});