const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Post = require('../../models/posts');
const category = require('../../models/category');
const {userAuthenticated} = require('../../helpers/authentication'); 
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const {
    multipleMongooseToObj,
    mongooseToObj,
  } = require("../../helpers/mongoobjecthelper");
const { error } = require('console');


router.all('/*', userAuthenticated,(req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});

router.get('/', (req,res)=>{

    Post.find({}).populate('category').then(posts=>{
        //console.log(posts);
        res.render('admin/posts', {posts: multipleMongooseToObj(posts)});
        
    });

});

//my post

router.get('/my-posts', (req,res)=>{

    Post.find({user: req.user.id}).populate('category').then(posts=>{
        //console.log(posts);
        res.render('admin/posts/my-posts', {posts: multipleMongooseToObj(posts)});
        
    });


});


router.get('/create', (req,res)=>{

    category.find({}).then(categories=>{

        res.render('admin/posts/create',{categories: multipleMongooseToObj(categories)});

    });
    

});

router.post('/create', (req,res)=>{

    let errors = [];

    if(!req.body.title){

        errors.push({message: 'please Add title'});
    }

    if(!req.body.body){

        errors.push({message: 'please Add a Description'});
    }

    if(errors.length > 0){

        res.render('admin/posts/create',{
            errors : errors
        });
    }else{

            let filename = 'ford-mustang-boss-429-1970.jpg';

            if(!isEmpty(req.files)){

                let file = req.files.file;
                filename = Date.now() + `-` + file.name;
                let dirUploads = './public/uploads/';
                
                file.mv( dirUploads + filename, (err)=>{

                    if(err) throw err;
                });
            
            }
            
            
            //console.log(req.files);

            //res.send('submit work');
            let allowComments = true;

            if(req.body.allowComments){
                allowComments = true;
            }else{
                allowComments = false;
            }

            const newPost = new Post({
                user: req.user.id,
                title: req.body.title,
                status: req.body.status,
                allowComments: allowComments,
                body : req.body.body,
                category : req.body.category,
                file:filename

            });

            newPost.save().then(savePost =>{
                
                req.flash('success_message', `Post ${savePost.title} Was create Successfully`);
                res.redirect('/admin/posts');
                //res.send(`<script>alert('post saved');</script>`);

            }).catch(error=>{
                console.log(error, 'Could not Save Post');
            });
        }

});

//get post

router.get('/edit/:id', (req,res)=>{
    //res.send(req.params.id);
    //res.render('admin/posts/edit');

    Post.findOne({_id: req.params.id}).then(posts=>{
        //console.log(posts);

        category.find({}).then(categories=>{

            res.render('admin/posts/edit',{post: mongooseToObj(posts), categories: multipleMongooseToObj(categories)});
    
        });
                
    });
    
});

//update post

router.put('/edit/:id', (req,res)=>{

    Post.findOne({_id: req.params.id}).then(post=>{
        
        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }
        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.category = req.body.category;
        post.body = req.body.body;

        if(!isEmpty(req.files)){

            let file = req.files.file;
            filename = Date.now() + `-` + file.name;
            post.file = filename;
            let dirUploads = './public/uploads/';
            
            file.mv( dirUploads + filename, (err)=>{

                if(err) throw err;
            });
        
        }

        post.save().then(updatedPost=>{
            req.flash('success_message','Post was Updated Successfully')
            res.redirect('/admin/posts/my-posts');
            //res.send('Its WOrks');
            
        });
        

       //res.render('admin/posts', {posts: multipleMongooseToObj(posts)});
        
    });

    //res.send('Its WOrks');
});


router.delete('/:id', (req,res)=>{

    // Post.remove({_id: req.params.id}).then(result=>{
    //     res.redirect('/admin/posts');
    // });

    Post.findOne({_id: req.params.id}).populate('comments').then(post=>{
        
        fs.unlink(uploadDir + post.file, (err)=>{
            
            if(!post.comments.length < 1){
                post.comments.forEach(comment => {
                    comment.remove();
                });
            } 
            
            post.remove().then(postRemove=>{
                req.flash('success_message','Post was successfully Deleted');
                res.redirect('/admin/posts/my-posts');
            });
        
        
        });

    });

});

module.exports = router;