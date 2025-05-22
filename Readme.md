## Steps
1. <u> Initializing project: </u>
  <br>This creates a pkg which other developers can also use.
  >npm init -y 
2. <u> Adding a pkg:</u> cat-me
>npm i cat-me
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
4. <u>Routing:</u>





package.json file tells us about all the (ingredients) basic details about all the pkg used in our project and it is for developers. If we only have package.json then we can regenerate node_modules and pakage-lock.json by using:

 >npm i

package-lock.json file is for computer/system and it tells about package in detail.