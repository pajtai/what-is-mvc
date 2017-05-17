'use strict';

const models = require('../models');

class PagesController {

    index (req, res, next) {
        // Index will show what /home shows
        req.params.page = 'home';
        this.show(req, res, next);
    }

    create (req, res) {
        res.send(`Create ${req.params.page}`);
    }

    show (req, res) {
        models.Pages.findOne({
            where: { slug: req.params.page }
        })
            .then(page => {
                res.send(page.title + ' : ' + page.content);
            })
            .catch(e => {
                console.log(404);
            });
    }

    edit (req, res) {
        res.send(`Edit ${req.params.page}`);
    }

    update(req, res) {
        res.send(`Update ${req.params.page}`);
    }

    delete(req, res) {
        res.send(`Delete ${req.params.page}`);
    }
}

module.exports = new PagesController();
