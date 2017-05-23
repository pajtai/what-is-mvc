'use strict';

const _ = require('lodash');

class AdminController {
    constructor (models) {
        this.models = models;
    }

    index(req, res) {
        res.send('admin index!');
    }

    create(req, res) {
        let model = req.params.type.charAt(0).toUpperCase() + req.params.type.slice(1);
        this.models[model].describe()
            .then(schema => {
                schema = _.omit(schema, ['id', 'createdAt', 'updatedAt']);
                console.log(JSON.stringify(schema, null, 4));
                res.render('pages/admin.create.view.pug', {
                    type: req.params.type,
                    modelName : model,
                    schema
                });
            });
    }
}

module.exports = models => {
    return new AdminController(models);
};
