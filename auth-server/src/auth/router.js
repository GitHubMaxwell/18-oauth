'use strict';

import express from 'express';

const authRouter = express.Router();

import User from './model.js';
import auth from './middleware.js';
import oauth from './lib/oauth.js';

// Generally, these will send a Token Cookie and do a redirect.
// For now, just spew out the token to prove we're ok.

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( user => res.send(user.generateToken()) )
    .catch(next);
});

authRouter.get('/login',auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/oauth', (req, res, next) => {
  // console.log('Ouch Github');
  // res.send('foobar');
  //http://localhost:3000/oauth?code=2ef8b2f31d69b6900148&state=autumn
  // parse the code out 
  // do a redirect here
  // env file CLIENT_URL

  let URL = process.env.CLIENT_URL;
  // call the oauth module / the import above
  // in oauth.js we havent written the code for it yet
  // the oauth module returns a promise thats a token
  // set a cookie with the token adn the redirect
  oauth.authorize(req)
    .then( token => {
      console.log('TOKEN?', token);
      //token is undefined
      //token now comes back as Invalid%20Thing
      res.cookie('auth',token);
      console.log('RESPONSE', res.cookie);
      //this comes back as a function?
      res.redirect(`${URL}?token=${token}`);
    })
    .catch(next);

});

// A little proof of life here, to show how we can protect any
// route with our auth middleware
authRouter.get('/showMeTheMoney', auth, (req,res,next) => {
  res.send('Here is all the ca$h');
});

export default authRouter;
