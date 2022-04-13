//Import Modules
const Comments = require('../model/comment.js');
const Tokens = require('./token.controller.js');
const Tasks = require('../model/task.js');

//Add new comment to task
exports.create = (req,res) => {
    console.log("Comment Creation Initiated...");
    //Validate Comment
    if(!req.body.comment) {
        console.log("Empty Comment Error.");
        return res.status(400).send({
            message: "Comment cannot be empty"
        });
    }
    if(!req.params.taskid) {
        console.log("Empty Task Id Parameter");
        return res.status(400).send({
            message: "Empty Task Number"
        });
    }
    if(!req.params.userid) {
        console.log("Empty User Id Error.");
        return res.status(400).send({
            message: "Empty User Id"
        });
    }
    console.log("Creating Comment...");
    var today = new Date();
    const newcomment = new Comments({
        lastupdate: today,
        body: req.body.comment
    });
    //Validate given User Id
    Tokens.validateByUserId({userId:req.params.userid})
    .then(uid => {
        if(uid[0] == 0) {
            res.status(400).send({
                message: "Token not found"
            });
        }
        if(uid[0] == 3) {
            res.status(400).send({
                message: "Empty User Id"
            });
        }
        if(uid[0] == 2) {
            res.status(400).send({
                message: "Session has expired. Please Log In again."
            });
        }
        if(uid[0] == 4) {
            res.status(500).send({
                message: "Some error has occured. Please try again."
            });
        }
        // if(!uid) {
        //     return res.status(400).send({
        //         message: "User is not logged in. Please log in and try again."
        //     });
        // }
        newcomment.userId = req.params.userid;
        console.log("User Id verified.");
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Token not found");
            return res.status(404).send({
                message: "User is not logged in or does not exist. Please log in and try again."
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error verifying user id"
        });
    });
    //Validate given Task Number
    Tasks.findOne({TaskNumber: req.params.taskid})
    .then(taskdata => {
        if(!taskdata) {
            console.log("Invalid Task Number.");
            return res.status(400).send({
                message: "Invalid Task Number"
            });
        }
        newcomment.taskid = taskdata.TaskNumber;
        console.log("Task Number verified.");
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Invalid Task Number.");
            return res.status(404).send({
                message: "Invalid Task Number"
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error verifying Task Number."
        });
    });
    //Save Comment to Database
    newcomment.save()
    .then(data => {
        res.send(data);
        console.log("Comment added to Database...");
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some error occured while writing to database"
        });
    });
};

//Update existing comment from task
exports.update = (req,res) => {
    console.log("Comment Updation Initiated...");
    //Validate Comment Body
    if(!req.body.comment) {
        console.log("Empty Comment Body.");
        return res.status(400).send({
            message: "Comment cannot be empty"
        });
    }
    if(!req.params.taskid) {
        console.log("Empty Task Number.");
        return res.status(400).send({
            message: "Empty Task Number"
        });
    }
    if(!req.params.userid) {
        console.log("Empty User Id.");
        return res.status(400).send({
            message: "Empty User Id"
        });
    }
    var today = new Date();
    console.log(today);
    Comments.findByIdAndUpdate(req.params.commentid,{
            lastupdate: today,
            body: req.body.comment
    },{new: true})
    .then(data => {
        if(!data) {
            console.log("Comment id not found");
            return res.status(400).send({
                message: "Comment not found with id : " + req.params.commentid
            });
        }
        if(req.params.userid !== data.userId) {
            console.log("Permission Denied.");
            return res.status(400).send({
                message: "You can only update your own comment."
            });
        }
        res.send(data);
        console.log("Comment Updated Successfully....");
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Comment id not found");
            return res.status(404).send({
                message: "Comment not found with id : " + req.params.commentid
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error verifying Comment Id."
        });
    });
};

//Delete existing comment from task
exports.delete = (req,res) => {
    console.log("Comment Deletion Initiated...");
    Comments.findByIdAndRemove(req.params.commentid)
    .then(data => {
        if(!data) {
            console.log("Comment not found.");
            return res.status(400).send({
                message: "Comment not found with id : " + req.params.commentid
            });
        }
        console.log("Comment deleted successfully...");
        res.send(data);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Comment not found.");
            return res.status(404).send({
                message: "Comment not found with id : " + req.params.commentid
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error verifying Comment Id."
        });
    });
};