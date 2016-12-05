var port = 3000
var spdy = require('spdy')
var express = require('express')
var path = require('path')
var fs = require('fs')

var app = express();

app.use(function(req, res, next) {
  res.setHeader('Link', '<//fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,700,700i,900,900i>; rel=prefetch,</style-main.css>;rel = prefetch,/CSS/header.css;rel = prefetch,<//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js>;rel = prefetch,</JS/libs/jquery.flexslider-min.js>;rel = prefetch,</images/mainpromo/welcome02-1600.jpg>;rel = prefetch');
  next();
});

app.use(express.static('production'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

const options = {
    key: fs.readFileSync(__dirname + '/mykey.pem'),
    cert:  fs.readFileSync(__dirname + '/my-cert.pem')
}
console.log(options)
spdy
  .createServer(options, app)
  .listen(port, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log('Listening on port: ' + port + '. Please run with https prefix.')
    }
  })
