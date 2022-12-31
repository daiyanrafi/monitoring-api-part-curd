const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const enviroment = require('./helpers/enviroments');
const data = require('./lib/data');

// module scaffolding
const app = {};

// testing write file
// data.create('test', 'newFile', { name: 'india', language: 'hindi' }, (err) => {
//     console.log('error was', err);
// });

// testing read file
// data.read('test', 'newFile', (err, result) => {
//     console.log(err, result);
// });

// testing update file
// data.update('test', 'newFile', { name: 'noyakhali', language: 'unknown' }, (err) => {
//     console.log(err);
// });

// testing delete file
// data.delete('test', 'newFile', (err) => {
//     console.log(err);
// });

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    console.log(app);
    server.listen(enviroment.port, () => {
        // console.log(`enviroment variable is ${process.env.NODE_ENV}`);
        console.log(`yo boi its listing to ${enviroment.port}`);
    });
};

// HANDLE REQ RESPONSE

app.handleReqRes = handleReqRes;
// start the server

app.createServer();
