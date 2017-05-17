'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const glob = require('glob');

const loadControllers = require('./loaders/controllers');
const loadModels = require('./loaders/models');
const loadRoutes = require('./loaders/routes');

const app = express();
const PORT = 3000;

exports.models = loadModels();
exports.controllers = loadControllers();
exports.boot = () => {
    app.set('view engine', 'pug');
    app.set('views', 'app/views');

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    app.use(bodyParser.json());

    loadRoutes(app);
    app.listen(PORT);
    console.log(`Express started on port ${PORT}`);
};
