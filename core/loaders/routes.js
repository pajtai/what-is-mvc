'use strict';

// Cannot require controllers in directly, since they're not defined yet here
const core = require('../index');
const routes = require('../../app/routes');

module.exports = app => {
    loadResourceControllers(app);
    loadBasicControllers(app);
};

function loadBasicControllers(app) {
    routes(app, core.controllers);
}

function loadResourceControllers(app) {
    let controllers = core.controllers;
    for (let controllerKey of Object.keys(controllers)) {
        let controller = controllers[controllerKey];
        if (!controller.resource) {
            continue;
        }
        // Using ifs because ES6 class instance methods are a pain to iterate over - presving optin to use them
        if (controller.index) {
            if (controller.default) {
                console.log('registering home page - this should only be called once');
                app.get('/', controller.index.bind(controller));
            }
            app.get(`/${controller.name}/`, controller.index.bind(controller));
        }
        if (controller.create) {
            app.get(`/${controller.name}/create`, controller.create.bind(controller));
        }
        if (controller.store) {
            app.post(`/${controller.name}`, controller.store.bind(controller));
        }
        if (controller.show) {
            app.get(`/${controller.name}/:${controller.singularName}`, controller.show.bind(controller));
        }
        if (controller.edit) {
            app.get(`/${controller.name}/:${controller.singularName}/edit`, controller.edit.bind(controller));
        }
        if (controller.update) {
            app.put(`/${controller.name}/:${controller.singularName}`, controller.update.bind(controller));
        }
        if (controller.destroy) {
            app.delete(`/${controller.name}/:${controller.singularName}`, controller.destroy.bind(controller));
        }
    }
}
