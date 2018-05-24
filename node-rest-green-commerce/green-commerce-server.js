const http = require('http'); //imports http package that helps with spinning up server 
const port = process.env.PORT || 3000; //Port for the project to run on, Usually inject enviroment variables into a running project

const gcApp = require('./green-commerce-app'); //the file we just created, and with it, its app.use function

const server = http.createServer(gcApp);  //we need to pass a listener, a func that executes everytime we get a new request, have to handle incoming requests

server.listen(port);  //pass the port as an arguement, starts listening on this point, then fires whatever we passed createServer
