'use strict';

class AdminController {
    index(req, res) {
        res.send('admin index!');
    }
}

module.exports = new AdminController();