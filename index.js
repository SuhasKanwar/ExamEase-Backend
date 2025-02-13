const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => { console.log('Connected to MongoDB!!!') })
    .catch(err => { console.error('Could not connect to MongoDB', err) });

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server has started successfully !!!');
});

const userRouter = require('./routes/user');
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`\n\nhttp://localhost:${PORT}\n\n`);
});