//Import modules
const mongoose = require('mongoose');

//Create token schema for sign-in verification
const TokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    startTime: mongoose.Schema.Types.Date,
    valid: Boolean
})

module.exports = mongoose.model('Token', TokenSchema);
