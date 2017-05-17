'use strict';

const express = require('express');
const glob = require('glob');

const loadControllers = require('./loadControllers');
const loadModels = require('./loadModels');
const loadRoutes = require('./loadRoutes');

const app = express();
const PORT = 3000;

exports.models = loadModels();
exports.controllers = loadControllers();
exports.boot = () => {
    loadRoutes(app);
    app.listen(PORT);
    console.log(`Express started on port ${PORT}`);
};
