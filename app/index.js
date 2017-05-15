'use strict';

const express = require('express');
const app = express();
const PORT = 3000;

const pageController = {
    index(req, res) {
        res.send('Hello World');
    }
};

app.get('/', pageController.index);

app.listen(PORT);
console.log(`Express started on port ${PORT}`);
