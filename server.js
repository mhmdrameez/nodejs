//Setting up the server
const express = require('express');

//Create express app
const app = express();


//Parse requests of content-type application/x
app.use(express.urlencoded({extended:false}));


//Parse requests of content-type application.json
app.use(express.json({extended:false}));


//Require routes for all controllers
const route = require('./app/route/route.js')(app);


//Define a simple route
app.get('/', (req, res) => {
    res.json({ "message": "Server trial message" })
});


//Listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

//Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log('Succesfully connected to the database');
}).catch(err => {
    console.log('Could not connect to database. Exiting now...');
    process.exit();
});