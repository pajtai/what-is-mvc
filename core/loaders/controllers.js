'use strict';

const glob = require('glob');
const path = require('path');

module.exports = () => {
    let controllers = {};

    console.log('- loading resource controllers -');
    glob.sync('app/controllers/resource/*.controller.js').forEach(controllerFilePath => {
        let controller = createController(controllerFilePath);
        // Flag this as a resource controller
        controller.resource = true;
        controllers[controller.name] = controller;
    });

    console.log('- load basic controllers -');
    glob.sync('app/controllers/basic/*.controller.js').forEach(controllerFilePath => {
        let controller = createController(controllerFilePath);
        controllers[controller.name] = controller;
    });

    return controllers;
};

function createController(controllerFilePath) {
    let controller = require(path.resolve(controllerFilePath));
    // You can optionally override the automatic name given via the file
    controller.name = controller.name || path.basename(controllerFilePath, '.controller.js');
    controller.singularName = controller.singularName || controller.name.replace(/s$/, '');
    console.log(`loading ${controller.name} -- ${controller.singularName}`);
    return controller;
}