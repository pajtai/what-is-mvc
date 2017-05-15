'use strict';

module.exports = {
    index,
    show,
    edit
};

// Not using es6 classes, since methods are not enumerable
function index(req, res, next) {
    // Index will show what /home shows
    req.params.page = 'home';
    show(req, res, next);
}

function show(req, res) {
    res.send(`This is the ${req.params.page} page.`);
}

function edit(req, res) {

}

