'use strict';

class PagesController {

    index (req, res, next) {
        // Index will show what /home shows
        req.params.page = 'home';
        this.show(req, res, next);
    }

    show (req, res) {
        res.send(`This is the ${req.params.page} page.`);
    }

    edit (req, res) {

    }

}

module.exports = new PagesController();
