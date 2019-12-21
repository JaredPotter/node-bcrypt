const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//          WEB SERVER
const webApp = express();
const webServerPort = 8080;
webApp.use(express.static('public'));
webApp.listen(webServerPort, () => {
    console.log(`HTTPS Web Server Stated on port ${webServerPort}!`);
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true
};
const serverPort = 3000;
const saltRounds = 10;

const serverApp = express();
serverApp.use(cors(corsOptions));
serverApp.use(bodyParser.json())

const inMemoryUserStoreDatabase = {
    jaredpotter: '$2b$10$S53UNOvv1czFLsVe.39fHekcVnBZqC4Ogkf0JfYAF3H/Omny46NoW'
};

serverApp.post('/register', (req, res) => {
    const body = req.body;

    if(!body || !body.username || !body.password) {
        res.status(400).send('Missing username and/or password.');
        return;
    }
    
    const username = body.username;
    const password = body.password;

    // Check if user already exists.
    if(inMemoryUserStoreDatabase[username]) {
        res.status(400).send('Username already exists.');
        return;
    }
    
    bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
        if(error) {
            res.status(500).send('Password Hash Failed.');
            return;
        }

        console.log(`New user '${username}' with hased password '${hashedPassword}'`);

        // Store in in-memory database.
        inMemoryUserStoreDatabase[username] = hashedPassword;

        res.status(201).send('CREATED');
    });
});

serverApp.post('/login', (req, res) => {
    const body = req.body;

    if(!body || !body.username || !body.password) {
        res.status(400).send('Missing username and/or password.');
        return;
    }
    
    const username = body.username;
    const password = body.password;

    debugger;

    if(inMemoryUserStoreDatabase[username]) {
        const hashedPassword = inMemoryUserStoreDatabase[username];

        bcrypt.compare(password, hashedPassword, (error, result) => {
            if(error) {
                res.status(400).send('Incorrect username/password.')
            }

            if(result) {
                res.status(200).send('Successfully logged in.');
            }
        });
    }
    else {
        // Message 'incorrect' by design not to leak existing users.
        res.status(400).send('Incorrect username/password.');
    }
});

serverApp.listen(serverPort, () => {
    console.log('Server Started on ' + serverPort);
});