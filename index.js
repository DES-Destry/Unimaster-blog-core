const express = require('express');
const {json, urlencoded} = require('body-parser');
const app = express();
const r = express().route();

const PORT = process.env.PORT || 80;

app.use(json());
app.use(urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send('Blog core');
});

app.listen(PORT, () => {
    console.log(`Server has been started at ${PORT} port...`);
});