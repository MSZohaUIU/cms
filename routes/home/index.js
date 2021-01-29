const express = require('express');
const router = express.Router();
const Post = require('../../models/posts');
//const comment = require('../../models/comment');
const category = require('../../models/category');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const localStratagy = require('passport-local').Strategy;
const {
    multipleMongooseToObj,
    mongooseToObj,
  } = require("../../helpers/mongoobjecthelper");
const { error } = require('console');
const { Passport } = require('passport');


router.all('/*',(req, res, next)=>{


    req.app.locals.layout = 'home';
    next();


});


router.get('/', (req,res)=>{

    // req.session.arafat = 'Arafat Zoha';
    // if(req.session.arafat){
    //     console.log(`we found ${req.session.arafat}`);
    //  }
    //res.send('Its WOrks');
    //console.log(path.join(__dirname, 'public'));

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage * page) - perPage).limit(perPage)
        .then(posts=>{
        Post.count().then(postCount=>{

            category.find({}).then(categories=>{

                res.render('home/index', 
                {posts: multipleMongooseToObj(posts),
                categories: multipleMongooseToObj(categories),
                current: parseInt(page),
                pages: Math.ceil( postCount / perPage )
                });
                
            });

        });
        
    });
    
});

router.get('/about', (req,res)=>{

   
    //res.send('Its WOrks');
    //console.log(path.join(__dirname, 'public'));
    res.render('home/about');

});

router.get('/login', (req,res)=>{

    //res.send('Its WOrks');
    //console.log(path.join(__dirname, 'public'));
    res.render('home/login');

});

//App login
passport.use(new localStratagy({usernameField: 'email'},(email, password, done)=>{
    console.log(email);
    
    User.findOne({email: email}).then(user=>{

            if(!user) return done(null,false, {message:'no user found'});

            bcrypt.compare(password, user.password, (err,matched)=>{

                if(err) return err;

                if(matched){
                    return done(null, mongooseToObj(user));
                }else{
                    return done(null, false, { message: 'Incorrect password.'});
                }
            });

    });
     
}));

passport.serializeUser(function(user, done) {
    
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err,user);
    });
  });

router.post('/login', (req,res, next)=>{
    //res.send('Its WOrks');
    //res.render('home/login');
    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash:true
    })(req, res, next);

});

router.get('/logout', (req,res)=>{

    req.logOut();
    res.redirect('/');

});

router.get('/register', (req,res)=>{

    //res.send('Its WOrks');
    //console.log(path.join(__dirname, 'public'));
    res.render('home/register');

});

router.post('/register', (req,res)=>{
    //res.send('Its WOrks');
    //res.render('home/register');

    let errors = [];

    if(!req.body.firstName){

        errors.push({message: 'please Enter a First Name'});
    }

    if(!req.body.lastName){

        errors.push({message: 'please Enter a Last Name'});
    }

    if(!req.body.email){

        errors.push({message: 'please Add an Email'});
    }

    if(!req.body.password){

        errors.push({message: 'please Must Enter a password'});
    }

    if(!req.body.passwordConfirm){

        errors.push({message: 'THis feild can not be empty'});
    }

    if(req.body.password != req.body.passwordConfirm){

        errors.push({message: 'Password field dont match'});
    }

    if(errors.length > 0){

        res.render('home/register',{
            errors : errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    }else{
        
        User.findOne({email: req.body.email}).then(user=>{

            if(!user){

                const newUser =  new User({

                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });
        
                bcrypt.genSalt(10, (err, salt)=>{
        
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{
                            
                            req.flash('success_message', 'You are now Registered, Please LogIN');
                            res.redirect('/login');
                            
                        });
                    });
        
                });

            }else{

                req.flash('error_message', 'That email Exist please Login');
                res.redirect('/login');

            }
        });
        
    }//end main else

});

router.get('/post/:slug', (req,res)=>{ 
//router.get('/post/:id', (req,res)=>{


    Post.findOne({slug: req.params.slug})
    //Post.findOne({_id: req.params.id})
    .populate({path : 'comments', match:{approveComment:true}, populate: {path : 'user', model: 'users'}})
    .populate('user')
    .then(posts=>{
     
        category.find({}).then(categories=>{

            //console.log(posts);
            res.render('home/post', {posts : mongooseToObj(posts), categories: multipleMongooseToObj(categories)});
            
        });

    });


});


module.exports = router;