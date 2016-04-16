# Scope.js

#### This is not another React!

Scope.js is only designed to provide a scope manager on Component. Although the APIs of Scope.js is similar to React, it is totally different from React.

Scope use React/jsx to write HTML in javascript code which get rid of concat strings. It has no concept of State while it has props and refs inspired from React.

The reason why I am not satisfied with React is that in many situations I do known when and where I need to update a component's view. I don't need virtual dom to tell where to update. However if you insist on state machine, you can accomplish it by yourself in Scope.js by add setState function and state property in creating a class.

A global state machine can be totally sophisticated since no developer can tell how many state there are in component when some data model changes. Thinking of the time when we write jQuery plugins, what I really need is how to quickly and easily deal with some elements and bind events on them. React did manage to deal with it. However, it do too much.

When you use some jQuery plugins on a React Component, a mistake often occurs because of the state change. When state changes some elements will be rewrite, such as you added a class on an element, after state changes it returns to the original class which is unexpected behaviour. The way to avoid this is to put the element in the state, but this is not an elegant way since it will greatly affect both the code style and the efficient.
 
Scope can be considered as and actually is just a small lib which let you deal with elements of a component conveniently. This is very useful when you need to write some event-intensive components, and it works nice with jQuery plugins.

Compared to React, Scope,js allows a function which return elements as an element, this will prevent the render function to be executed, and only part of the view's html will be update and the event related will be rebound automatically.

Scope.js use $.html function which use innerHTML method, this works efficiently in most cases.

Documentation ot Scope.js is under work.