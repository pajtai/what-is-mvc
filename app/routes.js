'use strict';

const express = require('express');

module.exports = (app, controllers) => {

    // We are creating a separate router, since we know that we will want to attach auth to admin eventually
    let adminRouter = express.Router();
    adminRouter.get('/:type', controllers.admin.index.bind(controllers.admin));
    adminRouter.post('/:type', controllers.admin.store.bind(controllers.admin));
    adminRouter.get('/:type/create', controllers.admin.create.bind(controllers.admin));

    app.use('/admin', adminRouter);
};