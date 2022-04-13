//Import modules
const Tokens = require('../model/token.js');
const { findByIdAndUpdate } = require('../model/user.js');
const Users = require('../model/user.js');

//Login Function
exports.login = (req,res) => {
    console.log('\n',"Login Initiated...");
    //Validate presence of data
    if(!req.body.userid) {
        console.log("Empty User Id field.");
        return res.status(400).send({
            message: "User ID is empty"
        });
    }
    if(!req.body.password) {
        console.log("Empty Password field.");
        return res.status(400).send({
            message: "Password is empty"
        });
    }
    //Fetch and validate user ID details
    console.log(req.body);
    Users.findById(req.body.userid)
    .then(userDet => {
        //console.log(userDet);
        if(!userDet) {
            console.log("Invalid User Id detected.");
            return res.status(404).send({
                message: "Invalid User ID"
            });
        }
        console.log("User Details Fetched successfully.");
        //Validate password of user
        console.log(userDet.validPassword(req.body.password));
        if(!userDet.validPassword(req.body.password)){
            console.log("Wrong password detected.");
            return res.status(400).send({
                message: "Invalid Password"
            });
        }
        if(userDet.validPassword(req.body.password)){
            console.log("Username and Password Verified...");
            //Login condition satisfied area - create token
            var today = new Date();
            console.log(today);
            const newToken = new Tokens({
                userId: req.body.userid,
                startTime: today,
                valid: true
            });
            console.log(newToken);
            //Save token to database
            newToken.save()
            .then(data => {
                console.log("Token Created successfully.");
                res.send(data);
            }).catch(err => {
                console.log("Database Error...");
                res.status(500).send({
                    message: err.message || "Some error occured while writing token to database."
                });
            });
        }
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            console.log("Invalid User Id Detected.");
            return res.status(404).send({
                message: "Invalid User ID"
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Some error occured. Please try again."
        });
    });

};

//Logout Function
exports.logout = (req,res) => {
    console.log('\n',"Logout Initiated...");
    //Validate request
    if(!req.params.tokenid) {
        console.log("Token Id is empty.");
        return res.status(400).send({
            message: "Token Id cannot be empty."
        });
    }
    //Find token and disable validity
    Tokens.findByIdAndUpdate(req.params.tokenid,{valid:false},{new:true})
    .then(token => {
        if(!token) {
            console.log("Token not found...");
            return res.status(400).send({
                message: "Token not found with id : " + req.params.tokenid
            });
        }
        console.log("Logout Successful...");
        console.log(token);
        res.send({message: "Logout successful."});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("Token not found...");
            return res.status(404).send({
                message: "Token not found with id : " + req.params.tokenid
            });
        }
        console.log("Error: "+err);
        return res.status(500).send({
            message: "Logout Unsuccessful"
        });
    });
};

//Token Validity Check for operations using token id
exports.validateByToken = (tokenId) => {
    console.log('\n',"Token Validity Check Initiated...");
    //Validate presence of tokenid
    if(!tokenId) {
        console.log("Empty Token Id field.");
        return 3;
    }
    //Find token from database
    Tokens.findById(tokenId)
    .then(data => {
        if(!data || !data.valid) {
            console.log("Invalid Login or Token Not Found.");
            return 0;
        }
        var today = new Date();
        var diff = Math.abs(today.getTime() - data.startTime.getTime());
        var minutes = Math.floor((diff % 3600000) / 60000);
        if(minutes>10 && data.valid) {
            data.valid = false;
            console.log("Expired Session Error...");
            return 2;
        }
        //Update token validity
        Tokens.findByIdAndUpdate(tokenId,{startTime: today},{new: true});
        console.log("Valid Token Found. Validity extended by 10 minutes.");
        return data.userId;
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("Token Not Found.");
            return 0;
        }
        console.log("Error: "+err);
        return 4;
    });
};

//Token validity check for operations using user id
exports.validateByUserId = (userId) => {
    console.log('\n',"Token Validity Check Initiated...");
    //Validate presence of userid
    if(!userId) {
        console.log("Empty User Id field.");
        return [3,data._id];
    }
    //Find token from database
    Tokens.findOne({userId: userId})
    .then(data => {
        if(!data || !data.valid) {
            console.log("Invalid Login or Token Not Found.");
            return [0,data._id];
        }
        var today = new Date();
        var diff = Math.abs(today.getTime() - data.startTime.getTime());
        var minutes = Math.floor((diff % 3600000) / 60000);
        if(minutes>10 && data.valid) {
            data.valid = false;
            console.log("Session has expired. Please Log in again.");
            return [2,data._id];
        }
        //Update token validity
        Tokens.findByIdAndUpdate(data,_id,{startTime: today},{new: true});
        console.log("Token is valid. Validity extended by 10 minutes.");
        return [1,data._id];
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("Token not found.");
            return [0,data._id];
        }
        console.log("Error: "+err);
        return [4,data._id];
    });
}