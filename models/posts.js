const { date } = require('faker');
const mongoose = require('mongoose');
const { schema } = require('./category');

const Schema = mongoose.Schema;

const postSchema = new Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    category:{
        type: Schema.Types.ObjectId,
        ref:'categories'
    },

    title:{
        type:String,
        require:true
    },

    status:{
        type:String,
        default: 'public'    
    },

    allowComments:{
        type: Boolean,
        require: true
    },

    body:{
        type: String,
        require: true 
    },

    
    file:{
        type: String,
    },

    date:{
        type: Date,
        default: Date.now()
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref:'comments'
    }]



}, {usePushEach: true});


module.exports = mongoose.model('posts', postSchema);