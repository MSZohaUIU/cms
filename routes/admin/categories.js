const express = require('express');
const category = require('../../models/category');
const router = express.Router();
//const faker = require('faker');

const {
    multipleMongooseToObj,
    mongooseToObj,
  } = require("../../helpers/mongoobjecthelper");

const catagory = require('../../models/category')

router.all('/*',(req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});

router.get('/', (req,res)=>{

    //console.log('categories');

    catagory.find({}).then(categories=>{
        res.render('admin/categories/index',{categories: multipleMongooseToObj(categories)});
    }); 

});

router.post('/create', (req,res)=>{

    const newCategory = category({

        name: req.body.name
    });

    newCategory.save().then(savedCategoy=>{
        
        res.redirect('/admin/categories');

    });

    

});


router.get('/edit/:id', (req,res)=>{

    //console.log('categories');

    category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit',{category: mongooseToObj(category)});
    }); 

});


router.put('/edit/:id', (req,res)=>{

    //console.log('categories');

    category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(updatedCategory=>{
            res.redirect('/admin/categories');

        });
    }); 

});


router.delete('/:id', (req,res)=>{

    category.remove({_id: req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    });
});

module.exports = router;