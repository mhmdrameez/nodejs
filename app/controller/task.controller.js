//Import User Schema module
const path = require('path');
const fs = require('fs');
const Tasks = require('../model/task.js');
const Tokens = require('./token.controller.js');
const Comments = require('../model/comment.js');


//Create and save new task
exports.create = (req,res) => {
    console.log('\n',"Task Creation Initiated...");
    //Validate Request
    console.log(req.body);
    if(!req.body.title || !req.body.type || !req.body.status || !req.body.assignee) {
        console.log("Empty Task Error.");
        return res.status(400).send({
            message: "Task Details cannot be empty."
        });
    }
    if(!req.params.tokenid) {
        console.log("Token Id Missing Error.");
        return res.status(400).send({
            message: "Access Denied. Please specify TokenId after login."
        });
    }
    //Token validation
    // var tokenValid = false;
    var currentUser = Tokens.validateByToken(req.params.tokenid);;
    var tokenValid = Tokens.validateByToken(req.params.tokenid);
    if(tokenValid === 0) {
        console.log("Invalid Login.");
        return res.status(400).send({
            message: "Invalid Login. Please try again."
        });
    }
    if(tokenValid === 2) {
        console.log("Expired Session.");
        return res.status(400).send({
            message: "Session has expired. Please Log in and try again."
        });
    }
    if(tokenValid === 3) {
        console.log("Token Id Missing Error.");
        return res.statur(400).send({
            message: "Token Id is empty."
        });
    }
    if(tokenValid >= 4) {
        console.log("Error: Unknown Error");
        return res.status(500).send({
            message: "Some Error has occured. Please try again."
        });
    }
    //Get today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var time = today.getHours() + today.getMinutes() + today.getSeconds();
    today = mm + '/' + dd + '/' + yyyy;
    taskno = yyyy+mm+dd+time;
    console.log(today);
    //Create new task
    const newTask = new Tasks({
        TaskNumber: taskno,
        TaskTitle: req.body.title,
        TaskType: req.body.type,
        Description: req.body.description || "",
        AcceptanceCriteria: req.body.accept || "",
        Status: req.body.status || "Finished",
        StartDate: req.body.startdate || today,
        DueDate: req.body.due || today,
        OriginalEstimate: req.body.estimate || 0,
        Assignee: req.body.assignee,
        Reporter: currentUser
    });
    console.log("Task Created.");
    //Save Task to database
    newTask.save()
    .then(data => {
        console.log("Task Successfullt Saved to Database...");
        res.send(data);
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some error occured while writing to database"
        });
    });
};


//Retrieve All Tasks
exports.getAll = (req,res) => {
    console.log('\n',"Task Retrieval Initiated...");
    Tasks.find()
    .then(tasks => {
        console.log("Tasks Retrieved Successfully...");
        res.send(tasks.concat(Comments.findOne({taskid:tasks.TaskNumber})));
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some error occured while fetching tasks."
        });
    });
};

//Retrieve Single Task details using Task Number
exports.getTask = (req,res) => {
    console.log('\n',"Retrieval of Single Task Initiated...");
    Tasks.findById(req.params.tasknumber)
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Task Retrieved Successfully...");
        res.send(taskDet);
        filename = taskDet.FilePath;
        res.setHeader('Content-Disposition', 'attachment: filename="' + filename + '"');
        file.pipe(res);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Task not found");
            return res.status(404).send({
                message: "Task not fount with id : " + req.params.tasknumber
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error fetching task with id : " + req.params.userId
        });
    });
};


//Update single task details using Task number
exports.update = (req,res) => {
    console.log('\n',"Task updation Initiated...");
    Tasks.findByIdAndUpdate(req.params.tasknumber,{
        TaskTitle: req.body.title,
        TaskType: req.body.type,
        Description: req.body.description,
        AcceptanceCriteria: req.body.accept,
        StartDate: req.body.startdate,
        DueDate: req.body.due,
        OriginalEstimate: req.body.estimate,
        Assignee: req.body.assignee,
        Reporter: req.body.reporter
    },{new: true})
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Task Updated Successfully...");
        res.send(taskDet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error updating task with id : " + req.params.userId
        });
    });
};


//Delete single task using Task number
exports.delete = (req,res) => {
    console.log('\n',"Deletion of Task Initiated...");
    Tasks.findByIdAndRemove(req.params.tasknumber)
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Task Deleted Successfully");
        res.send({message: "Task deleted successfully."});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Could not delete task with id : " + req.params.tasknumber
        });
    });
};

//Upload Image to Task
exports.upload = (req,res) => {
    console.log("Image Upload Initiated...");
    if(!req.file) {
        console.log("Empty File Error.");
        return res.status(400).send({
            message: "Image file cannot be empty."
        });
    }
    if(!req.params.tasknumber) {
        console.log("Empty Task Number Error.");
        return res.status(400).send({
            message: "Task number cannot be empty."
        });
    }
    console.log(req.file.filename);
    Tasks.findByIdAndUpdate(req.params.tasknumber,{FilePath: req.file.filename},{new: true})
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Image Uploaded Successfully...");
        res.send(taskDet);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error updating task with id : " + req.params.userId
        });
    });
};

//Download Image from Task
exports.download = (req,res) => {
    console.log("Image Download Initiated...");
    if(!req.params.tasknumber) {
        console.log("Empty Task Number Error.");
        return res.status(400).send({
            message: "Task number cannot be empty."
        });
    }
    var filename = "";
    Tasks.findById(req.params.tasknumber)
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Task Found.");
        filename = taskDet.FilePath;
        res.setHeader('Content-Disposition', 'attachment: filename="' + filename + '"');
        file.pipe(res);
        console.log("Image Download Successful...");
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Image not found.");
            return res.status(404).send({
                message: "Image not found"
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error fetching image"
        });
    });
};

//Delete Image from Task
exports.deleteImage = (req,res) => {
    console.log("Image Deletion Initiated...");
    if(!req.params.tasknumber) {
        console.log("Empty Task Number Error.");
        return res.status(400).send({
            message: "Task number cannot be empty."
        });
    }
    Tasks.findByIdAndUpdate(req.params.tasknumber,{FilePath: ""},{new: true})
    .then(taskDet => {
        if(!taskDet) {
            console.log("Task not found.");
            return res.status(404).send({
                message: "Task not found with id : " + req.params.tasknumber
            });
        }
        console.log("Task Found.");
        //filename = taskDet.FilePath;
        //res.setHeader('Content-Disposition', 'attachment: filename="' + filename + '"');
        //file.pipe(res);
        console.log("Image Deletion Successful...");
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Image not found.");
            return res.status(404).send({
                message: "Image not found"
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error fetching image"
        });
    });
};