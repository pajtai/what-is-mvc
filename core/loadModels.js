'use strict';

const fs        = require('fs');
const glob      = require('glob');
const path      = require('path');
const Sequelize = require('sequelize');
const env       = process.env.NODE_ENV || 'development';
const config    = require('../config/config.json')[env];

module.exports = () => {
    let db = {};

    if (config.use_env_variable) {
        var sequelize = new Sequelize(process.env[config.use_env_variable]);
    } else {
        var sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

    glob.sync('app/models/*.model.js').forEach(modelPath => {
        let model = sequelize['import'](path.resolve(modelPath));
        db[model.name] = model;
    });

    Object.keys(db).forEach(function(modelName) {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
};
