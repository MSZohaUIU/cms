const express = require('express');
const router = express.Router();
const faker = require('faker');
const User = require('../../models/posts');
const category = require('../../models/category');
const {userAuthenticated} = require('../../helpers/authentication');
const { mongooseToObj } = require('../../helpers/mongoobjecthelper');


router.all('/*', userAuthenticated,(req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});

router.get('/', (req,res)=>{
    //console.log(req.user);
    User.count({}).then(postCount=>{
        res.render('admin/index',{user: mongooseToObj(req.user), postCount: postCount});
    });
    

});

router.post('/generate-fake-posts', (req,res)=>{

    for(let i = 0 ; i < req.body.amount; i++){

        let post = new User();

        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();

        post.save(function(err){
            if(err) throw err;
        });
        

    }
    res.redirect('/admin/posts');

});

module.exports = router;