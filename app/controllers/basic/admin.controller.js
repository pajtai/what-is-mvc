'use strict';

class AdminController {
    index(req, res) {
        res.send('admin index!');
    }
}

module.exports = models => {
    return new AdminController();
};
