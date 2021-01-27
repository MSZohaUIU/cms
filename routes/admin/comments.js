const express = require('express');
const router = express.Router();
const {userAuthenticated} = require('../../helpers/authentication');
const Post = require('../../models/posts');
const Comment = require('../../models/comment');
const {
    multipleMongooseToObj,
    mongooseToObj,
  } = require("../../helpers/mongoobjecthelper");

  router.all('/*', userAuthenticated,(req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();

});

router.get('/',(req,res)=>{

    Comment.find({user: req.user.id}).populate ('user').then(comments=>{

        res.render('admin/comments',{comments: multipleMongooseToObj(comments)});

    });
    
    


});

router.post('/',(req,res)=>{


    Post.findOne({_id: req.body.id}).then(post=>{

        console.log(post);


        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });

        post.comments.push(newComment);
        post.save().then(savedPost=>{

            newComment.save().then(savedComment=>{

                req.flash('success_message','Your comment will be reviewed in a Second')

                res.redirect(`/post/${post.id}`);

            });

        });



    }).catch(err =>{
        res.send(err);
    });
    //res.send('Its works');

});

router.delete('/:id', (req,res)=>{

    // Comment.findByIdAndDelete(req.params.id).then(deleted=>{
    //     res.redirect('/admin/comments');
    // });

    Comment.remove({_id: req.params.id}).then(deleted=>{

        Post.findOneAndUpdate({comments: req.params.id}, {$pull : {comments : req.params.id}}, (err, data)=>{
            if(err) console.log(err);
        });
        res.redirect('/admin/comments');
    });

});


router.post('/approve-comment',(req,res)=>{

    // console.log(req.body.approveComment);
    // console.log(req.body.id);

    Comment.findByIdAndUpdate(req.body.id, 
        {$set: {approveComment: req.body.approveComment}}, (err,result)=>{

            if(err) return err;
            res.send(result);

    });

});


  module.exports = router;