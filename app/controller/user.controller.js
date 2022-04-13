//Import User Schema module
const Users = require('../model/user.js');
const Roles = require('../model/role.js');
const Tokens = require('./token.controller.js');
//const uuidv4 = require('uuid/dist/v4');


//Create and Save a new User
exports.create = (req,res) => {
    console.log("User Creation Initiated...");
    //Validate request
    console.log(req.body)
    if(!req.body.name) {
        console.log("Empty Name field.");
        return res.status(400).send({
            message : "Cannot create empty user"
        });
    }
    if(!req.params.userid || !req.params.tokenid) {
        console.log("Empty user/token parameter.");
        return res.status(400).send({
            message: "Access Denied. Please specify UserId and TokenId after login."
        });
    }
    //Token validation
    var tokenValid = Tokens.validateByToken(req.params.tokenid)[0];
    if(tokenValid === 0) {
        return res.status(400).send({
            message: "Invalid Login. Please try again."
        });
    }
    if(tokenValid === 2) {
        return res.status(400).send({
            message: "Session has expired. Please Log in and try again."
        });
    }
    if(tokenValid === 3) {
        return res.statur(400).send({
            message: "Token Id is empty."
        });
    }
    if(tokenValid >= 4) {
        return res.status(500).send({
            message: "Some Error has occured. Please try again."
        });
    }
    // var tokenValid = false;
    // Tokens.findById(req.params.tokenid)
    // .then(token => {
    //     if(!token) {
    //         return res.status(400).send({
    //             message: "Access Denied. Login validation unsuccessful. Please enter valid token."
    //         });
    //     }
    //     tokenValid = token.validToken();
    //     token.updateToken();
    // }).catch(err => {
    //     if(err.kind === 'ObjectId') {
    //         return res.status(404).send({
    //             message: "Access Denied. Login validation unsuccessful. Please enter valid token."
    //         });
    //     }
    //     return res.status(500).send({
    //         message: "Some error occured. Please try again."
    //     });
    // });
    // if(!tokenValid) {
    //     return res.status(400).send({
    //         message: "Login has expired. Please Login and try again."
    //     });
    // }
    //Role Validation
    var roleValid = false;
    Roles.findOne({userId:req.params.userid})
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: "Access Denied. User validation unsuccessful. Please enter valid user id."
            });
        }
        roleValid = data.validToken();
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Access Denied. User validation unsuccessful. Please enter valid user id."
            });
        }
        return res.status(500).send({
            message: "Some error occured. Please try again."
        });
    });
    if(!roleValid) {
        return res.status(400).send({
            message: "You do not have the permission to create user."
        });
    }
    //Creation only after login token and user roles are valid
    var today = new Date();
    var date = today.getFullYear()+(today.getMonth()+1)+today.getDate();
    var time = today.getHours() + today.getMinutes() + today.getSeconds();
    var dateTime = date+time;
    console.log(today);
    //Create User
    const newUser = new Users({
        userid: dateTime,
        name: req.body.name || "Anonymous",
        email:  req.body.email || "anonymous@user.com"
    });
    newUser.setPassword(req.body.password);
    console.log("User Created.");

    //Save user to database
    newUser.save()
    .then(data => {
        console.log("User saved to database successfully...");
        res.send(data);
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some error occured while writing to database."
        });
    });
};


//Retrieve and return all users from database
exports.getAll = (req,res) => {
    console.log("Retrieval of all users Initiated...");
    Users.find()
    .then(users => {
        console.log("All users retrieved successfully.");
        res.send(users);
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some error occured while fetching users."
        });
    });
};


//Retrieve single user with userID
exports.getUser = (req,res) => {
    console.log("Single user Retrieval Initiated...");
    Users.findById(req.params.userId)
    .then(userDet => {
        if(!userDet) {
            console.log("User not found.");
            return res.status(404).send({
                message: "User not found with id : " + req.params.userId
            });
        }
        console.log("User Retrieved Successfully...");
        res.send(userDet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("User not found.");
            return res.status(404).send({
                message: "User not fount with id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error fetching user with id : " + req.params.userId
        });
    });
};


//Update single user with userId
exports.update = (req,res) => {
    console.log("Updation Initiated...");
    //Validate Request
    if(!req.params.userId) {
        console.log("Empty User id parameter.");
        return res.status(400).send({
            message: "User Id cannot be empty."
        });
    }

    //Find User and update values with values in the request body
    Users.findByIdAndUpdate(req.params.userId, {
        name: req.body.name || "Anonymous",
        email: req.body.email || "Anonymous@user.com",
    },{new : true})
    .then(user => {
        if(!user) {
            console.log("User not found");
            return res.status(400).send({
                message: "User not found with id : " + req.params.userId
            });
        }
        console.log("User Updated Successfully...");
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("User not found.");
            return res.status(404).send({
                message: "User not found with id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error updating user with id : " + req.params.userId
        });
    });
};


//Delete single user with userId
exports.delete = (req,res) => {
    console.log("Deletion Initiated...");
    Users.findByIdAndRemove(req.params.userId)
    .then(user => {
        if(!user) {
            console.log("User not found");
            return res.status(404).send({
                message: "User not found with id : " + req.params.userId
            });
        }
        console.log("Deletion Successful...");
        res.send({message: "User deleted successfully."});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("User not found");
            return res.status(404).send({
                message: "User not found with id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Could not delete user with id : " + req.params.userId
        });
    });
};