//Import Modules
const mongoose = require('mongoose');

//Create Comment schema
const CommentSchema = mongoose.Schema({
    taskid: {
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    lastupdate: {
        type: mongoose.Schema.Types.Date,
        required: true
    },
    body: {
        type: String,
        required: true
    }
})