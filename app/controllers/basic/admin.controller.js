'use strict';

class AdminController {
    constructor () {
        this.routes = {
            create : '/admin/:type/create',
            store : '/admin/:type'
        }
    }
}

module.exports = new AdminController();