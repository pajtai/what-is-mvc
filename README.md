# What is MVC

Understanding the concepts behind the popular design pattern of MVC will make you a more well rounded programmer. There
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

