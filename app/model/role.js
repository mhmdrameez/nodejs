//Role schema

//Import Modules
const mongoose = require('mongoose');

//Create Role Schema
const RoleSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        unique: true
    },
    roleName : {
        type : String,
        required : true,
        enum: ['super admin','project manager','user'],
        default : 'user'
    } 
})

module.exports = mongoose.model('Role', RoleSchema);