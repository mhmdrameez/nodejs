//Import Schema Module
const Roles = require('../model/role.js');


//Create new role
exports.create = (req,res) => {
    console.log('\n',"Role Creation Initiated...");
    console.log(req.body);
    req.body.role.toLowerCase();
    if(req.body.role != "user" && 
        req.body.role != "super admin" && 
        req.body.role != "project manager") {
            console.log("Invalid Role Error.");
            return res.status(400).send({
                message: "Cannot create role. Invalid Role."
            });
    }
    //Create Role
    const newRole = new Roles({
        userId: req.body.userId,
        roleName: req.body.role || 'user'
    });
    console.log("New Role Created.");
    //Save Role to database
    newRole.save()
    .then(data => {
        console.log("New Role Successfully Saved to Database...");
        res.send(data);
    }).catch(err => {
        console.log("Error: "+err);
        res.status(500).send({
            message: err.message || "Some Error occured while writing to database."
        });
    });
};


//Retrieve role of a user
exports.getRole = (req,res) => {
    console.log('\n',"Role Retrieval Initiated...");
    Roles.findOne({userId:req.params.userId})
    .then(userRole => {
        if(!userRole) {
            console.log("Role not found.");
            return res.status(404).send({
                message: "Role not found for Id : " + req.params.userId
            });
        }
        console.log("Role Retreived Successfully...");
        res.send(userRole)
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Role not found.");
            return res.status(404).send({
                message: "Role not found for Id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error fetching role for Id : " + req.params.userId
        });
    });
};


//Update role of a user
exports.update = (req,res) => {
    console.log('\n',"Role Updation Initiated...");
    //Validate request
    if(!req.params.role) {
        console.log("Empty Role Error.");
        return res.status(400).send({
            message: "Role cannot be empty."
        });
    }
    //Convert to Lowercase
    req.params.role.toLowerCase();
    //Find UserId and update Role
    Roles.findByIdAndUpdate(req.params.userId,{ roleName: req.params.role || 'user'},{new : true})
    .then(userRole => {
        if(!userRole) {
            console.log("Role not found.");
            return res.status(400).send({
                message: "Role not found for user id : " + req.params.userId
            });
        }
        console.log("Role Updated Successfully...");
        res.send(userRole);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Role not found.");
            return res.status(404).send({
                message: "Role not found for user id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Error updating user role"
        });
    });
};


//Delete role of a user
exports.delete = (req,res) => {
    console.log('\n',"Role Deletion Initiated...");
    Roles.findByIdAndRemove(req.params.userId)
    .then(userRole => {
        if(!userRole) {
            console.log("Role not found.");
            return res.status(404).send({
                message: "User role not found with user id : " + req.params.userId
            });
        }
        console.log("Role Deleted Successfully...");
        res.send({ message: "User Role deleted successfully."});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("Role not found.");
            return res.status(404).send({
                message: "User role not found with user id : " + req.params.userId
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Could not delete role of user id : " + req.params.userId
        });
    });
};