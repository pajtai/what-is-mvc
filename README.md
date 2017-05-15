# What is MVC

MVC allows you to separate your business logic from the rest of your user interface. Models encapsulate the business logic,
views show the user interface, and controllers receive input and call render views via models.

Understanding the concepts behind the popular architectural design pattern of MVC will make you a more well rounded programmer. There
are many frameworks across multiple languages that use MVC. To illustrate MVC, we will be using Node. We'll build an
MVC express app from the ground up. The best way to learn something is to build it.

Node is especially suited for this type of exploration, since node has a lot of great libraries, but no towering MVC
frameworks. Many other languages have mature established MVC frameworks. Ruby has Ruby on Rails, and PHP has Laravel.
Node has several, but none are as well established as its counterparts. Node however has a rich ecosystem of libraries
via NPM. Building a simple MVC app is a great way to leverage the rich NPM ecosystem. You might be wondering what the 
difference between a library and a framework is. You call a library. A framework calls you.

Let's start by breaking MVC into it's component parts. M is for Model, V is for View, and C is for Controller. There is
one more essential part without which MVC doesn't work: a router. So MVC is a design pattern to help organize how you
handle http requests. Each request is routed to a controller. Each controller has one or more actions. A request is
handled by an action. The action uses one or more models to inform a view. To understand in detail what all of this means,
we're gong to build a website. The website will have:

1. Web pages
1. The ability to edit those pages
1. User authentication 
1. User authorization to edit web pages
1. User authorization to create, edit, and delete users

## Web Pages

Let's start with the typical hard coded "Hello World!" home page. Any user can look at this page. To render it, we will
need a router, a controller, and a view. Since we know the contents of the page, we don't need a model yet.

You can follow along by cloning the [What Is MVC](https://github.com/pajtai/what-is-mvc) repo and checking out the tags 
we are discussing.

```
git clone git@github.com:pajtai/what-is-mvc.git
```

### Controllers

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

To try the above out, clone this repo and do: `git checkout basic-controller; npm run dev`. Make sure you have nodemon
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

To flesh out the example let's include all the actions Laravel uses:

```javascript
app.get('/', pageController.index);
app.get('/create', pageController.create);
app.post('/', pageController.store);
app.get('/:page', pageController.show);
app.get('/:page/edit', pageController.edit);
app.put('/:page', pageController.update);
app.delete('/:page', pageController.destroy);
```

This is `git checkout basic-controller2`.

So far this has just been an exercise in create a pretty standard looking express app with some extra boiler plate. But
now that we have a pattern going with what our controllers look like, we can have express load all our controllers 
automagically based on convention. 

Let's decide on our conventions. It will be that `app/controllers` has all our controllers.
Each file in that directory will export a controller. Let's agree that all our controller names will be plural. So for 
the Users controller we'll use `/users` and `/users/:user`. Also, let's name our files `*.controller.js`. This allows
us to easily open controller files with IDE's that don't support opening `controllers/*.js`. Let's also agree that 
controller names come from the file name : `name.controller.js`. This will be used in `/name/:name/edit` for example.
`req.param` will just be `name.replace(/s$/,'')`, but you can override that.

Note that we are not using ES6 classes for our constructors, since it is a pain to iterate over methods in an ES6 class
instance.... especially if some of those methods may also be static. Also, we run into issue with loss of context for
things like `app.get('/', controller.method)`.

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

You can try out the above with `git checkout controller-loader`.

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
