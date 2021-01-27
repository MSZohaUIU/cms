const { date } = require('faker');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({

    // user:{},

    name:{
        type:String,
        require:true
    }

});


module.exports = mongoose.model('categories', CategorySchema);