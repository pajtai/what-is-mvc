'use strict';

const BB = require('bluebird');
const express = require('express');
const glob = BB.promisify(require('glob'));
const path = require('path');

const app = express();
const PORT = 3000;

glob('app/controllers/*.controller.js')
    .then(controllers => {
        controllers.forEach(controllerFilePath => {
            let controller = require(path.resolve(controllerFilePath));

            // You can optionally override the automatic name given via the file
            controller.name = controller.name || path.basename(controllerFilePath, '.controller.js');
            controller.singularName = controller.singularName || controller.name.replace(/s$/,'');
            console.log(`loading ${controller.name} - ${controller.singularName}`);

            for (let action of Object.keys(controller)) {
                switch (action) {
                case 'index':
                    app.get(`/${controller.name}/`, controller.index);
                    break;
                case 'create':
                    app.get(`/${controller.name}/create`, controller.create);
                    break;
                case 'store':
                    app.post(`/${controller.name}`, controller.store);
                    break;
                case 'show':
                    app.get(`/${controller.name}/:${controller.singularName}`, controller.show);
                    break;
                case 'edit':
                    app.get(`/${controller.name}/:${controller.singularName}/edit`, controller.edit);
                    break;
                case 'update':
                    app.put(`/${controller.name}/:${controller.singularName}`, controller.update);
                    break;
                case 'destroy':
                    app.delete(`/${controller.name}/:${controller.singularName}`, controller.destroy);
                    break;
                }
            }
        });

        app.listen(PORT);
        console.log(`Express started on port ${PORT}`);
    })
    .catch(e => console.log(e));
