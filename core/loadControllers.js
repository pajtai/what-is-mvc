'use strict';

const glob = require('glob');
const path = require('path');

let controllers = {};

glob.sync('app/controllers/*.controller.js').forEach(controllerFilePath => {
    let controller = require(path.resolve(controllerFilePath));

    // You can optionally override the automatic name given via the file
    controller.name = controller.name || path.basename(controllerFilePath, '.controller.js');
    controller.singularName = controller.singularName || controller.name.replace(/s$/, '');
    console.log(`loading ${controller.name} - ${controller.singularName}`);

    controllers[controller.name] = controller;
});

module.exports = controllers;