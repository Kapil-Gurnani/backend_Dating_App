const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const IncomingForm = require('formidable').IncomingForm
const router = express.Router();
const fs = require('fs');
// const path = require('path');
var io = require('socket.io').listen(8000);


var clients = [];
let imgData;
io.sockets.on('connection', async function (socket) {
    // clients = await User.clients();
    console.log('Client Connected');
    // console.log("clients  "+JSON.stringify(clients,undefined,2));
    // clients.push(socket  .id);
    socket.on('add-user', function (data) {
        clients[data.email] = {
            "socket": socket.id
        };
    });

    socket.on('like', function (data) {
        console.log("Like: " + data.email + " to " + data.likeemail);
        console.log(clients[data.email]);
        console.log(clients[data.likeemail]);


        if (clients[data.email]) {
            io.sockets.connected[clients[data.email].socket].emit("add-message", "Liked");
            io.sockets.connected[clients[data.likeemail].socket].emit("add-message", "Someone liked you");
        } else {
            console.log("User does not exist: " + data.username);
        }
    });
    socket.on('superlike', function (data) {
        console.log("Like: " + data.email + " to " + data.likeemail);
        console.log(clients[data.email]);
        console.log(clients[data.likeemail]);


        if (clients[data.email]) {
            io.sockets.connected[clients[data.email].socket].emit("add-message", "Super Liked");
            io.sockets.connected[clients[data.likeemail].socket].emit("add-message", data.likeemail + " liked you");
        } else {
            console.log("User does not exist: " + data.username);
        }
    });
    socket.on('block', function (data) {
        console.log("Like: " + data.email + " to " + data.likeemail);
        console.log(clients[data.email]);
        console.log(clients[data.likeemail]);


        if (clients[data.email]) {
            io.sockets.connected[clients[data.email].socket].emit("add-message", "Liked");
            io.sockets.connected[clients[data.likeemail].socket].emit("add-message", "Someone liked you");
        } else {
            console.log("User does not exist: " + data.username);
        }
    });
});

router.post('/', async (req, res) => {
    res.send('Backend is UP');
})

router.post('/upload', (req, res) => {
    var form = new IncomingForm()

    form.on('file', (field, file) => {
        // console.log(file.name);
        fileName = file.name;
        fs.readFile(file.path, (err, data) => {
            if (err) {
                console.log(error);
                return;
            }
            imgData = data;
            // console.log(data);
            fs.writeFile(`${__dirname}${/../}uploads/${fileName}`, data, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Created');

            });
        })
        // fs.writeFile(process.env.host)
        // Do something with the file
        // e.g. save it to the database
        // you can access it using file.path
    })
    form.on('end', () => {
        res.json()
    })
    form.parse(req);
});

router.get('/getUsers', async (req, res) => {
    let usersData = await User.clients();
    if (!usersData) {
        res.status(404).send('No users');
    } else {
        res.status(200).send(usersData);
    }
});
//LOGIN and SIGNUP start
router.post('/users', async (req, res) => {
    // Create a new user
    try {
        let userData = req.body;
        userData.img = {
            data : imgData,
            contentType : 'image/jpg'
        };
        userData.imagePath = `${fileName}`;
        console.log(userData);
        const user = new User(userData);
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const {
            email,
            password
        } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({
                error: 'Login failed! Check authentication credentials'
            })
        }
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/users/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})
//LOGIN and SIGNUP finish

//LIKE start
router.post('/users/me/like', async (req, res) => {
    let email = req.body.email;
    let likeemail = req.body.likeemail;
    const user = await User.like(email, likeemail);
    notificationSocket.emit('like', {
        like: 'liked'
    });
    res.status(200).send(user);
})
//LIKE finish

//SUPER LIKE start
router.post('/users/me/superlike', auth, async (req, res) => {
    let email = req.body.email;
    let superlikeemail = req.body.superlikeemail;
    const user = await User.superLike(email, superlikeemail);
    res.status(200).send(user);
})
//SUPER LIKE finish

//BLOCK start
router.post('/users/me/block', auth, async (req, res) => {
    let email = req.body.email;
    let blockemail = req.body.blockemail;
    const user = await User.block(email, blockemail);
    res.status(200).send(user);
})
//BLOCK finish


module.exports = router