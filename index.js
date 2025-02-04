const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server has started successfully !!!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});