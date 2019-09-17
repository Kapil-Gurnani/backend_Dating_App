const express = require('express');
const port = process.env.PORT;
const userRouter = require('./src/routers/user');
const path = require('path');
require('./src/db/db');

const app = express();

app.use(express.json());
app.use('/uploads', express.static((__dirname+'/uploads')));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

    res.setHeader('Access-Control-Allow-Credentials', true);
    //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
  });
app.use(userRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});