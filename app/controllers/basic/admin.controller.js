'use strict';

const _ = require('lodash');

class AdminController {
    constructor (models) {
        this.models = models;
    }

    index(req, res) {
        let modelName = this.getModel(req);
        this.models[modelName].findAll({
            where : {},
            order: [
                ['updatedAt', 'DESC']
            ]
        })
            .then(models => {
                res.render('pages/admin.browse.view.pug', {
                    type: req.params.type,
                    modelName,
                    models
                });
            })
    }

    create(req, res) {
        let modelName = this.getModel(req);
        this.models[modelName].describe()
            .then(schema => {
                schema = _.omit(schema, ['id', 'createdAt', 'updatedAt']);
                res.render('pages/admin.create.view.pug', {
                    type: req.params.type,
                    modelName,
                    schema
                });
            });
    }

    getModel(req) {
        return req.params.type.charAt(0).toUpperCase() + req.params.type.slice(1);
    }
}

module.exports = models => {
    return new AdminController(models);
};
