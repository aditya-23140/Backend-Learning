## Steps

1. <u> Initializing project: </u>
   <br>This creates a pkg which other developers can also use.
   > npm init -y
2. <u> Adding a pkg:</u> cat-me
   > npm i cat-me

```js
const catMe = require("cat-me");
var cat = catMe();
console.log(cat); //outputs random ASCII cat images.
```

3. <u>Creating a server:</u>
   <br> There isn't a need to install `http` pkg as it is pre-installed in node

```js
const server = http.createServer((req, res) => {
  res.end("Hello, world!"); //for any request we get on server our response will be "Hello, world!"
});
//running the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening at: http://localhost:${PORT}/`);
});
```

4. <u>Routing:</u> req.url gives route which we are hitting like localhost:3000/about will give about as value.

```js
const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url === "/about") {
    res.end("About Page");
  }
  if (req.url === "/profile") {
    res.end("Profile Page");
  }
});
```

5. <u>Setting up express</u>:
   <br>Express is like a toolbox and calling `express()` opens it. It is used to create servers..

```
npm i express
```

```js
const express = require("express");
const app = express();
```

6. <u>Routing in Express</u>: `.get` is used for all get request on a route and `.post` for POST requests.

```js
app.get("/", (req, res) => {
  res.send("Hello, world");
});
```

7. <u>Rendering HTML with express</u>: using EJS

```
npm i ejs
```

Setting up does not require to import it just use :

```js
app.set("view engine", "ejs");
```

To use ejs we need to create a views directory and inside it need to create `index.ejs`. Syntax for index.ejs is similar to normal HTML. And to render it we use (`.render("[filename]")`):

```js
app.get("/", (req, res) => {
  res.render("index");
});
```
8. <u>Middleware</u>: This allows to redirect to another site when accessing restricted pages.
```js
//Middleware, it is run at every route
app.use((res, req, next)=>{
  console.log("Middleware");
  return next() //allows for normal flow.
})
```

























<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
package.json file tells us about all the (ingredients) basic details about all the pkg used in our project and it is for developers. If we only have package.json then we can regenerate node_modules and pakage-lock.json by using:

> npm i

package-lock.json file is for computer/system and it tells about package in detail.

#### Execution with node.js need to be reexecuted on any code changes so use nodemon (it updates in realtime without needing to reexcute the server)

```
npx nodemon [filename]
```
