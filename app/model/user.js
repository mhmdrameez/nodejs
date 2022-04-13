//To hash passwords

//Import modules
const mongoose = require('mongoose');
var crypto = require('crypto');
//var uniqueValidator = require('mongoose-unique-validator');

//Create User Schema
const UserSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        minLength: 3,
        maxLength: 15
    },
    email : {
        type : String,
        required: true,
        trim: true,
        minLength: 6,
        maxLength: 50
    },
    hash : String,
    salt : String
})

// Function to set salt and hash the password for a user 
UserSchema.methods.setPassword = function(password) { 
     
    // Creating a unique salt for a particular user 
    this.salt = crypto.randomBytes(16).toString('hex'); 
     
    // Hashing user's salt and password with 1000 iterations, 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}; 

// Function to check the entered password is correct or not 
UserSchema.methods.validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 

module.exports = mongoose.model('User', UserSchema);