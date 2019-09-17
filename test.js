var express = require('express');
var path = require('path');
var server = express();
server.use('/uploads', express.static(path.join(__dirname, 'public')))
// server.use(express.static('uploads'));
server.listen(8080);