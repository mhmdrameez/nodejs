// Task Schema

//Import Modules
const mongoose = require('mongoose');

//Create Task Schema
const TaskSchema = mongoose.Schema({
    TaskNumber : {
        type : String,
        required : true,
        unique : true
    },
    TaskTitle : {
        type : String,
        required : true
    },
    TaskType : {
        type : String,
        required : true
    },
    Description : {
        type : String
    },
    AcceptanceCriteria : {
        type : String
    },
    Status : {
        type : String,
        required : true
    },
    StartDate : {
        type : Date,
        required : true
    },
    DueDate : {
        type : Date,
        required : true
    },
    OriginalEstimate : {
        type : Number,
        required : true
    },
    Asignee : {
        type : Object
    },
    Reporter : {
        type : Object
    },
    FilePath : {
        type: String
    }
})


module.exports = mongoose.model('Task', TaskSchema);