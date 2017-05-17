'use strict';

const express = require('express');
const glob = require('glob');
const path = require('path');

const app = express();
const PORT = 3000;


exports.controllers = require('./loadControllers');
exports.models = require('./loadModels');
exports.boot = () => {
    for (let controller of Object.keys(exports.controllers)) {

        controller = exports.controllers[controller];
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


    app.listen(PORT);
    console.log(`Express started on port ${PORT}`);
};
