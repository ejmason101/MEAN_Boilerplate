const path = require('path');
// holds the express app
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// mongodb and openshift health check stuff and whatnot.. Not even sure if still needed but whatver
app.get("/pagecount", function(req, res) {
    res.sendStatus(200);
});




var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   =  '0.0.0.0' || process.env.IP   || process.env.OPENSHIFT_NODEJS_IP,
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

// this is weird but i think this is okay
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD']
        mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
      mongoURLLabel = mongoURL = 'mongodb://';
      if (mongoUser && mongoPassword) {
        mongoURL += mongoUser + ':' + mongoPassword + '@';
      }
      // Provide UI label that excludes user id and pw
      mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
      mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

    }
  }

if(mongoURL){
    console.log('mongoURL from openshift is: ' + mongoURL);
    
    // Set reset password link to point to the okc cluster
    process.env.resetPasswordLink = "http://REPLACEWITHPRODURL/auth/resetpassword/";
} else {
    console.log('mongoURL was empty, setting to local development')
    mongoURL = 'mongodb://localhost:27017/MEAN_boilerplate'

    // Set the reset password link to point to localhost development in this case
    process.env.resetPasswordLink = "http://localhost:4200/auth/resetpassword/";
}

mongoose.connect(mongoURL, {useNewUrlParser : true});
var db = mongoose.connection;
db.on('error', function callback() {
    console.error.bind(console, 'connection error:');
    console.error("TODO ALERT ADMIN THAT THE DB IS OFFLINE");
    // Wait like 20 seconds and then try again
    // wait(10);

});
db.once('open', function callback () {
    console.log("Connected to Mongodb Instance");
    console.log("Accepting connections to webapp @ port " + port)
});


// parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.urlencoded({extended: false}));

// Adding post route for messaages at /TextEverything/message

// Static folders
app.use("/", express.static(path.join(__dirname, "angular")));

// Alloc CORS -- allows one site to access another sites resources despite being under different domain names
app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader(
        "Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");

    next();
});


const userRoutes = require("./routes/user");

app.use("/api/user", userRoutes);

// Return the base angular app if no API calls match
// Did this change between angular7 --> angular8? now this isnt
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "angular", "index.html"));
});

module.exports = app;
