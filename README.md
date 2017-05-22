# What is MVC

# Intro

MVC allows you to separate your business logic from the rest of your user interface. Models encapsulate the business logic,
views show the user interface, and controllers receive input and render views via models.

Understanding the concepts behind the popular architectural design pattern of MVC will make you a more well rounded programmer. There
are many frameworks across multiple languages that use MVC. To illustrate MVC, we will be using Node. We'll build an
MVC express app from the ground up. The best way to learn something is to build it.

Node is especially suited for this type of exploration, since node has a lot of great libraries, but no towering MVC
frameworks. Many other languages have mature established MVC frameworks. Ruby has Ruby on Rails, PHP has Laravel, ASP.net
has the MVC Framework. Node has several, but none are as well established as its counterparts. Node however has a rich ecosystem of libraries
via NPM. Building a simple MVC app is a great way to leverage the rich NPM ecosystem. You might be wondering what the 
difference between a library and a framework is. You call a library. A framework calls you.

Let's start by breaking MVC into it's component parts. M is for Model, V is for View, and C is for Controller. There is
one more essential part without which MVC doesn't work: a router. So MVC is a design pattern to help organize how you
handle http requests. Each request is routed to a controller. Each controller has one or more actions. A request is
handled by an action. The action uses one or more models to inform a view. 

In addition to the main actors above, there a suite of helpers that an MVC framework uses. These helpers vary from 
framework to framework, but they essentially help you further organize your app. These secondary actors include things
like services, mailers, startup scripts, templating for views, an ORM for models, etc.

Since MVC is an organizational pattern, you'll notice that MVC frameworks have well defined places for all your various
types of files. This is one the things that makes MVC so powerful. Organizing things clearly removes a great amount of
cognitive load and enable speedier development.

MVC frameworks also have a lot of helper, that are not part of MVC per se. Separating out these concepts from the core
MVC concepts is one of the goals of this post.

The above sounds like a great idea, but it is described in very general terms. To understand in detail what all of it 
means, we're gong to build a website. The website will have:

1. Web pages
1. The ability to edit those pages
1. User authentication 
1. User authorization to edit web pages
1. User authorization to create, edit, and delete users

Let's start with the typical hard coded "Hello World!" home page. Any user can look at this page. To render it, we will
need a router, a controller, and a view. Since we know the contents of the page, we don't need a model yet.

You can follow along by cloning the [What Is MVC](https://github.com/pajtai/what-is-mvc) repo and checking out the tags 
we are discussing.

```
git clone git@github.com:pajtai/what-is-mvc.git
```

# Controllers

The first thing we'll do is setup our app using an `npm init -y` and creating a `.gitignore`. Now we're ready to 
include express and start the app:

```javascript
'use strict';

const express = require('express');
const app = express();
const PORT = 3000;

const pageController = {
    index(req, res) {
        res.send('Hello World');
    }
};

app.get('/', pageController.index);

app.listen(PORT);
console.log(`Express started on port ${PORT}`);
```

To try the above out, clone this repo and do: [`git checkout basic-controller; npm run dev`](https://github.com/pajtai/what-is-mvc/tree/basic-controller). Make sure you have nodemon
installed globally.

You'll notice that the `index` action is handling the home page get request. Take a look at [the actions Laravel controllers
use](https://laravel.com/docs/5.4/controllers#resource-controllers). One of the strengths of MVC is speed through
convention. If you get used to creating pages and endpoints that respond to a set of set actions with a certain http
verbs, then you'll be able to create and edit your endpoints quickly.

Let's fill out our page controller. These are the actions we need for now:

* Show a particular page `GET /:page` will be handled by `pageController.show`.
* Edit a particular page at `GET /:page/edit` via an admin will be handled by `pageController.edit`.
* Update a page via an api at `PUT /:page` will be handled by `pageController.update.
 
To show our home page, we'll map `/home` to `/`. Our other controllers will all have a prefix, like `users/:user`.

Let's update our app to reflect the above. We'll soon break our 
controller out into a separate file.

```javascript
'use strict';

const express = require('express');
const app = express();
const PORT = 3000;

const pageController = {
    edit(req, res) {
        res.send(`This is the ${req.page} edit page.`);
    },
    index(req, res, next) {
        req.page = 'home';
        pageController.show(req, res, next);
    },
    show(req, res) {
        res.send(`This is the ${req.page} page.`);
    }
};

app.get('/', pageController.index);
app.get('/:page', pageController.show);
app.get('/:page/edit', pageController.edit);

app.listen(PORT);
console.log(`Express started on port ${PORT}`);

```

If you try the above and visit http://localhost:3000/ and http://localhost:3000/home , you'll see the both produce the
same output.

## Actions

To flesh out the example let's include all the actions Laravel uses:

```
Laravel Router Verbs and Actions

+-----------+-----------------------+-----------+-------------------+
| Verb      | URI                   | Action    | Route Name        |
+-----------+-----------------------+-----------+-------------------+
| GET       | /photos               | index     | photos.index      |
| GET       | /photos/create        | create    | photos.create     |
| POST      | /photos               | store     | photos.store      |
| GET       | /photos/{photo}       | show      | photos.show       |
| GET       | /photos/{photo}/edit  | edit      | photos.edit       |
| PUT/PATCH | /photos/{photo}       | update    | photos.update     |
| DELETE    | /photos/{photo}       | destroy   | photos.destroy    |
+-----------+-----------------------+-----------+-------------------+
```

```javascript
app.get('/', pageController.index);
app.get('/create', pageController.create);
app.post('/', pageController.store);
app.get('/:page', pageController.show);
app.get('/:page/edit', pageController.edit);
app.put('/:page', pageController.update);
app.delete('/:page', pageController.destroy);
```

This is [`git checkout basic-controller2`](https://github.com/pajtai/what-is-mvc/tree/basic-controller2).

So far this has just been an exercise in create a pretty standard looking express app with some extra boiler plate. But
now that we have a pattern going with what our controllers look like, we can have express load all our controllers 
automagically based on convention. 

Let's decide on our conventions. It will be that `app/controllers` has all our controllers.
Each file in that directory will export a controller. Let's agree that all our controller names will be plural. So for 
the Users controller we'll use `/users` and `/users/:user`. Also, let's name our files `*.controller.js`. This allows
us to easily open controller files with IDE's that don't support opening `controllers/*.js`. Let's also agree that 
controller names come from the file name : `name.controller.js`. This will be used in `/name/:name/edit` for example.
`req.param` will just be `name.replace(/s$/,'')`, but you can override that.

Not all controllers will want to handle all actions, so let's make our controller loader smart enough for that.
I'm going to use [glob](https://www.npmjs.com/package/glob) for pulling in our controllers, and 
[bluebird](https://github.com/petkaantonov/bluebird) for handling async. Here is where the rich npm ecosystem really
starts to shine.

Below is our controller loader. We can now add controllers to the controller directory, and they wil be automatically
loaded:

```javascript
'use strict';

const BB = require('bluebird');
const express = require('express');
const glob = BB.promisify(require('glob'));
const path = require('path');

const app = express();
const PORT = 3000;

glob('app/controllers/*.controller.js')
    .then(controllers => {
        controllers.forEach(controllerFilePath => {
            let controller = require(path.resolve(controllerFilePath));

            // You can optionally override the automatic name given via the file
            controller.name = controller.name || path.basename(controllerFilePath, '.controller.js');
            controller.singularName = controller.singularName || controller.name.replace(/s$/,'');
            console.log(`loading ${controller.name} - ${controller.singularName}`);

            // Using ifs because ES6 class instance methods are a pain to iterate over - presving optin to use them
            if (controller.index) {
                app.get(`/${controller.name}/`, controller.index.bind(controller));
            }
            if (controller.create) {
                app.get(`/${controller.name}/create`, controller.create.bind(controller));
            }
            if (controller.store) {
                app.post(`/${controller.name}`, controller.store.bind(controller));
            }
            if (controller.show) {
                app.get(`/${controller.name}/:${controller.singularName}`, controller.show.bind(controller));
            }
            if (controller.edit) {
                app.get(`/${controller.name}/:${controller.singularName}/edit`, controller.edit.bind(controller));
            }
            if (controller.update) {
                app.put(`/${controller.name}/:${controller.singularName}`, controller.update.bind(controller));
            }
            if (controller.destroy) {
                app.delete(`/${controller.name}/:${controller.singularName}`, controller.destroy.bind(controller));
            }
        });

        app.listen(PORT);
        console.log(`Express started on port ${PORT}`);
    })
    .catch(e => console.log(e));
```

You can try out the above with [`git checkout controller-loader`](https://github.com/pajtai/what-is-mvc/tree/controller-loader).

These type of Controllers are called "Resource" Controllers in Laravel parlance. It is very convenient
to have the routing generate automatically for these types of controllers. Not all Controllers have to be
Resource Controllers. Eventually we'll have to figure how to flag Resource Controllers as such, so that we 
can create Controllers that don't automatically get loaded into the routing.

Here is what out controller looks like. Note that use of ES6 classes is optional, and the below can be achieved with
plain methods.

```javascript
// pages.controller.js
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

```

Let's first stub out the rest of pages and all of the users controller, and then we'll move on to Models. Here's is what the stubbed out Users Controller looks like:

```javascript
'use strict';

class UsersController {
    index (req, res, next) {
        res.send(`Index ${req.params.user}`);
    }

    create (req, res) {
        res.send(`Create ${req.params.user}`);
    }

    show (req, res) {
        res.send(`This is the ${req.params.user} page.`);
    }

    edit (req, res) {
        res.send(`Edit ${req.params.user}`);
    }

    update(req, res) {
        res.send(`Update ${req.params.user}`);
    }

    delete(req, res) {
        res.send(`Delete ${req.params.user}`);
    }

}

module.exports = new UsersController();
```

# Models

There is no need to use an ORM for models, but it is often convenient to do so. [Sequlize](https://www.npmjs.com/package/sequelize) is a popular ORM for SQL
databases. In addition to its ORM functionality, it also includes support for migrations. We will be using Sequelize
for our models.

Let's create a page model. You'll notice we have both a Page Model and a Page Controller. Controllers are often paired
with models like this. Sometime a controller can use more than one Model, but most often they will be paired one to one.
This means that you will frequently have to decide whether a piece of code should go in a Model, a Controller, or maybe
even somewher else. A common philosophy is thin controllers and fat models. This is because controllers are dependent
on routing. So you'll be looking at the request object a lot in a Controller. This makes it easy to write non reusable
controller code. Models on the other hand can be more abstract. If you find yourself repeating code in one Model and then
another, you can extract that code as a separate module or service.

TODO: discuss importance of seeds / migrations / deploys

## Migrations

One thing to watch out for with migrations, is that column additions require both a migration and a model update. For 
example, if we add a slug column to the `pages` table, the requires an `addColumn` in the migration and adding `slug`
to the model.

## Seeds

To create a Page Model, we must first connect to the database. This means we have to get configs from somewhere. For now
we will hard code some localhost configs, so make sure you have mysql installed.

The first thing we'll do is programmatically describe our databases. This is done using migrations.

```bash
npm install -g sequelize-cli 
# from the project root
sequelize init
# create our first migration file
sequelize migration:create
# now initialize the models dir in app/models
sequlize init:models --models-path app/models
```

[Here](http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types) are the Sequelize data types.

The docs say to use mysql2, but only mysql works. Also, the `config`, `migrations`, and `model` dirs must be in the root
of your repo.

Here is what our Pages model looks like after initializing and manually tweaking:

```bash
sequelize  model:create --name Pages --attributes id:integer,title:string,content:text
```

```javascript
'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pages = sequelize.define('Pages', {
      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
      },
      title: {
          type: DataTypes.STRING
      },
      content: {
          type: DataTypes.TEXT
      },
      createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
      },
      updatedAt: {
          allowNull: false,
          type: DataTypes.DATE
      }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Pages;
};
```

Now we'll seed the db with the home page:

```bash
sequelize seed:create --name home-page-seed --models-path app/models
```

Sequelize has a nice CLI. It work by default with all directories in the app root. In our case models should be in `app/`,
so keep that in mind.

Running seeds is like running migrations.

queryInterface.bulkInsert errors out and has no docs, so you can just import models and do that.

The sequelize general guide is at: http://docs.sequelizejs.com/

and the detailed docs are at: http://docs.sequelizejs.com/identifiers.html

So our initial seed is:

```javascript
'use strict';

const models = require('../app/models');

module.exports = {
    up: function (queryInterface, Sequelize) {
        // couldn't get queryInterface.bulkInsert to work
        return models.Pages
            .findOrCreate({where: {
                title: 'Home',
                content: '<h1>Hello world!</h1>'
            }})
            .spread((user, created) => {
                console.log(user.get({
                    plain : true
                }));
                console.log('created', created);
            });
    },

    down: function (queryInterface, Sequelize) {
        return models.Pages
            .destroy({where: {
                title: 'Home',
                content: '<h1>Hello world!</h1>'
            }})
            .then(numDeleted => {
                console.log('deleted', numDeleted);
            });
    }
};
```

To run the seed from the root of our project we can do:

```bash
sequelize db:seed:all --models-path app/models
```

The above is idempotent. It can be run multiple times and will only ever add one row to the table due to the `findOrCreate`.

## Using Models in Controllers

Now that we have a Model and some data, let's show some data from the DB at `/pages`. We'll have to update our Pages
Controller. We'll update the show action:

```javascript
    show (req, res, next) {
        models.Pages.findOne({
            where: { slug: req.params.page }
        })
            .then(page => {
                res.send(page.title + ' : ' + page.content);
            })
            .catch(e => {
                console.log(404);
                next();
            });
    }
```

### Adding the home page at `/`

Let's allow picking a controller to handle the home page. We'll say that if the controller has this.default = true, then
it is the home page controller.

```javascript
class PagesController {
    
    constructor () {
        this.default = true;
    }
```

And in our controller loader:

```javascript
// No need to check for handling the home page if there is no index
if (controller.index) {
    if (controller.default) {
        console.log('registering home page - this should only be called once');
        app.get('/', controller.index.bind(controller));
    }
    app.get(`/${controller.name}/`, controller.index.bind(controller));
}
```

### Some cleanup before moving on

At this point we're ready for our first `create` page, but before we do that let's separate out the core of the app from
the rest. By the core I mean the things that setup the routes and load the models and controllers.

Let's break that out into a folder called `core`, while leaving the rest of the things in `app`. This will give us the
following directory structure for now. We will build upon this, and eventually move `core` into its own npm:

```
app
    controllers
    models
config
core
migrations
seeders
```

For now we will simply hard code everything in core, and we will decide later how to configure it.

Do [`git checkout core-created`](https://github.com/pajtai/what-is-mvc/tree/core-created) to take a look at the beginnings of core.

Let's move on to how we would edit a web page.

# Views

So far we've just been using express' `res.render` to return strings from the database. This method quickly becomes 
cumbersome. Templating data via views is much nicer. We'll use pug template, but the same principles apply for all types
of templating.

## Creating pages

To add pages, we need an admin form at `/pages/create` into which we can add the new page content. Let's setup the Page
Controller `create` action to render a view for us:

```bash
# in the terminal
npm install --save pug
```

```javascript
// add to core/index.js
app.set('view engine', 'pug');
app.set('views', 'app/views');
```

```javascript
// modify the Pages Controller
create (req, res) {
    res.render('pages/pages.create.view.pug');
}
```

And now let's create our simple edit form. We know where the action should go based upon our MVC conventions:

```jade
html
    head
        title Create a Page
        link(   rel="stylesheet"
                type="text/css"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
                integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
                crossorigin="anonymous")
    body
        .container
            .jumbotron
                h1 Create a Page
            form(action="/pages" method="post")
                .form-group
                    label(for="title") Title
                    input#title.form-control(type="text" name="title" placeholder="Enter title")
                .form-group
                    label(for="slug") Slug
                    input#slug.form-control(type="text" name="slug" placeholder="Enter slug")
                    small.form-text.text-muted The part after /pages/
                .form-group
                    label(for="content") Content
                    textarea#content.form-control(name="content" rows="5")
                button.btn.btn-primary(type="submit") Create
```

We do some form cleanup later, since we might want to protect against things like CSRF, but for now we'll just worry
about implementing the `store` action:

```bash
npm install --save body-parser
```

```javascript
// add to core/index.js
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
```

The above will parse form data into a JSON object available as `req.body`.

Now we can complete the page creation functionality with:

```javascript
// modify page.controller.js
store (req, res) {
    models.Pages.create(req.body)
        .then(() => {
            res.redirect(`/pages/${req.body.slug}`);
        })
        .catch(e => {
            res.send(e);
        });
}
```

To look at the code for this do [`git checkout create-functionality`](https://github.com/pajtai/what-is-mvc/tree/create-functionality).

## A generic create page

One thing to note, is that this create page looks very generic. If we add users, our page will look very similar. It seems
like we should be able to create a single Admin Controller that handles all or our different data types. All it would have
to do is look at the model and based on the model fields build out the admin page.

Another advantage of having a single Admin Controller is that it makes the url structure more standard. Currently there is
no one admin prefix. For creating users, you would have to go to `/users/create` and for pages you got `/pages/create`.
If we have one admin controller, then creating of users and pages would be `/admin/users/create` and `/admin/pages/create`
respectively. This seems to make more sense to me.

Additionally, eventually will want auth on our admin. With express it would be easy to create a router at `/admin` and add
an auth middleware to that.

Finally, we'll keep our controllers cleaner and less repetitive.

Unfortunately, this will require some creative additions to our Controller functionality, but
otherwise we will be stuck creating the same admin like features for each Controller.

## The Admin Controller

The first thing to notice about the admin controller is that it doesn't adhere to our standard Resource Controller routing.
To create a new page for example, one would expect to go to `/admin/pages/create`. A Resource
Controller's routing would be `/admin/create`. This means we need to have to the ability to
create other types of Controllers than resource controllers. The easiest way to achieve this is
to just not load the Controller automatically at all. We can just have the actions tied to routes
in a separate routes file.

We can simply create a subdirectory inside `app/controllers`. The folder structure is a little nested
at this point, but it'll be nice and explicit. `app/controllers/resource` will get auto loaded as
Resource Controllers. `app/controllers/basic` will not.

To achieve this, let's first update `core/loaders/controllers` and load the resource controllers 
 and then the basic controllers. We should flag the resource controllers, so that they can be
 easily loaded into the routes.
 
```javascript
glob.sync('app/controllers/resource/*.controller.js').forEach(controllerFilePath => {
    let controller = createController(controllerFilePath);
    // Flag this as a resource controller
    controller.resource = true;
    controllers[controller.name] = controller;
});
```

Now we just have to make sure that when we load routes, we only load routes from Resource Controllers.

```javascript
for (let controllerKey of Object.keys(controllers)) {
    let controller = controllers[controllerKey];
    if (!controller.resource) {
        continue;
    }
```

Run `git checkout basic-controllers` to take a look at the above.

To implement the admin controller, all we need is a routes file. Let's put it at `app/routes.js`. We can retrieve the Controllers
from core using `require.main.require('./core').controllers`, but how are we going to retrieve the app for routing?
We could expose `core.app`, but at this point it might be better to start using dependency injection. That will get rid
of all the require statements, and it'll make it easy to test all of our files by calling them with mocks.

So let's implement DI for routes.js first. Then we can do it for the Controllers and Models too.

Let's test out `routes.js` by attaching the admin index controller to it.

```javascript
'use strict';

const express = require('express');

module.exports = (app, controllers) => {

    // We are creating a separate router, since we know that we will want to attach auth to admin eventually
    let adminRouter = express.Router();
    adminRouter.get('/:type', controllers.admin.index);

    app.use('/admin', adminRouter);
};
```

We'll think about which controller the `/admin` will take later.

We can load `routes.js` after loading our Resource Controllers. So we'll update `core/loaders/routes.js`:

```javascript
'use strict';

// Cannot require controllers in directly, since they're not defined yet here
const core = require('../index');
const routes = require('../../app/routes');

module.exports = app => {
    loadResourceControllers(app);
    loadBasicControllers(app);
};

function loadBasicControllers(app) {
    routes(app, core.controllers);
}
```

`git checkout admin-router` to take a look at the above.

### Cleanup

Let's move a few things out of `core`. The goal of `core` is to have the minimal set of features for an mvc framework.
While an ORM is great for mvc, the particular you choose shouldn't matter. Additionally, while we've got a directory structure
going, and an MVC framework should support using standard directory structures, the particular directory structure we use
shouldn't matter.

Finally, while our feature set is relatively small at this point, we should document and test the features we have.


## Dependency Injection

Let's make sure that all automatically loaded files work with dependency injection. Controllers need models. Models need
their ORM. We already have the models being loaded with `sequlize` and `DataType`, so all we need to do is update the loader
for controllers.

First we'll pass the models to the loader for controllers:

```javascript
exports.models = loadModels();
exports.controllers = loadControllers(exports.models);
```

Then we'll pass the models into each controller:

```javascript
module.exports = (models) => {
let controllers = {};

glob.sync('app/controllers/resource/*.controller.js').forEach(controllerFilePath => {
    let controller = createController(controllerFilePath, models);
    ... 
    
function createController(controllerFilePath, models) {
    let controller = require(path.resolve(controllerFilePath))(models);
```

and then update the controllers from requiring in the models to accepting them as an argument:

```javascript
module.exports = models => {
    new PagesController(models);
};
```

## Admin Page

Let's start with `/:type/create` for our admin panel: