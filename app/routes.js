'use strict';

const express = require('express');

module.exports = (app, controllers) => {

    // We are creating a separate router, since we know that we will want to attach auth to admin eventually
    let adminRouter = express.Router();
    adminRouter.get('/:type', controllers.admin.index);
    adminRouter.get('/:type/create', controllers.admin.create);

    app.use('/admin', adminRouter);
};