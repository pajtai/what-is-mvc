'use strict';

const express = require('express');
const app = express();
const PORT = 3000;

const pageController = {
    index(req, res, next) {
        // Index will show what /home shows
        req.params.page = 'home';
        pageController.show(req, res, next);
    },
    create() {},
    store() {},
    show(req, res) {
        res.send(`This is the ${req.params.page} page.`);
    },
    edit(req, res) {
        res.send(`This is the ${req.params.page} edit page.`);
    },
    update() {},
    destroy() {}
};

app.get('/', pageController.index);
app.get('/create', pageController.create);
app.post('/', pageController.store);
app.get('/:page', pageController.show);
app.get('/:page/edit', pageController.edit);
app.put('/:page', pageController.update);
app.delete('/:page', pageController.destroy);

app.listen(PORT);
console.log(`Express started on port ${PORT}`);
