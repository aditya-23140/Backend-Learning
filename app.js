const http = require("http"); //http is by default installed in node js so no need to install this pakage

//Creating server
const server = http.createServer((req, res) => {
  console.log(req.url); //url tell which route we are hitting like localhos:3000/about will return /about;
  res.end("Hello, world!"); //for any request we get on server our response will be "Hello, world!"
});

//running the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening at: http://localhost:${PORT}/`);
});
