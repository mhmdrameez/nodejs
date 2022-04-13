module.exports = (app) => {
    const multer = require('multer');
    const Users = require('../controller/user.controller.js');
    const tasks = require('../controller/task.controller.js');
    const roles = require('../controller/role.controller.js');
    const tokens = require('../controller/token.controller.js');
    const comments = require('../controller/comment.controller');

    var upload = multer({dest:'images/'});

    //User Functions Routed here
    //Create new user
    app.post('/user', Users.create);

    //Retrieve all user details
    app.get('/user', Users.getAll);

    //Retrieve single user details with user id
    app.get('/user/:userId', Users.getUser);

    //Update single user details with user id
    app.put('/user/:userId', Users.update);

    //Delete a user with user id
    app.delete('/user/:userId', Users.delete);



    //Role Functions Routed here
    //Create new role
    app.post('/role', roles.create);

    //Update role for a user
    app.put('/role/:userId', roles.update);

    //Retrieve role of a user
    app.get('/role/:userId', roles.getRole);

    //Delete role of a user
    app.delete('/role/:userId', roles.delete);


    
    //Task Functions Routed here
    //Create new task
    app.post('/task/:tokenid', tasks.create);

    //Retrieve all tasks
    app.get('/task', tasks.getAll);

    //Retrieve single task details using Task number
    app.get('/task/:tasknumber', tasks.getTask);

    //Update single task details using Task number
    app.put('/task/:tasknumber', tasks.update);

    //Delete single task using Task number
    app.delete('/task/:tasknumber', tasks.delete);

    //Add new Comment using task number
    app.post('/task/comment',comments.create);

    //Update existing Comment using Comment Id
    app.put('/task/comment/:commentid',comments.update);

    //Delete comment using Comment Id
    app.delete('/task/comment/:commentid',comments.delete);

    //Upload Image to task
    app.post('/task/image/:tasknumber',upload.single('image'),tasks.upload);

    //Download Image to task
    app.get('/task/image/:tasknumber',upload.single('image'),tasks.download);

    //Login using userid and password
    app.get('/login',tokens.login);

    //Logout and disable token
    app.put('/logout/:tokenid',tokens.logout);
}

