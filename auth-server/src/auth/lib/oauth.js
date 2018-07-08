
'use strict';

import superagent from 'superagent';

import express from 'express';



import User from '../model';

const authorize = (req) => {
  //this will return a promise
  // for testings just make it work be immediately returning something via Promise.resolve('stuff')
  // so this promise because its passing the fake token back is then hitting the router.js /showMeTheMoney route but that route ALSO has auth middleware and is trying to authenticate you with the 'FAKE POL TOKEN' ending up with an error
//   return Promise.resolve('FAKE POL TOKEN');

  //wire up all the superagent calls now
  ///oauth?code=37f4dc314318cecadbe5&state=autumn

  let code = req.query.code;
  console.log('(1 Got code from Github)');
  //have the code so we want to exchange it for a token

  //i dont know what this has to be sent as / google requires it to be a form
  return superagent.post('https://github.com/login/oauth/access_token')
  // dont think this url is right
    // .type()
    .send({
      client_id:process.env.GITHUB_CLIENT_ID,
      client_secret:process.env.GITHUB_CLIENT_SECRET,
      code:code,
      redirect_uri:process.env.API_URL + '/oauth',
      state:process.env.SECRET,
    })
    .then( response => {
      //by default the access token takes the follwing form
      //access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer
      let gitHubToken = response.body.access_token;
      console.log('(2) got a token from Github');
      return gitHubToken;
    })
    .then(token => {
      //we got a token now we have to get the user out of it
      console.log('TOKEN:',token);
      return superagent.get(`https://api.github.com/user?access_token=${token}`)
      // in get hub you send the token on the URL directly rather than setting it like in Google
        // .set('Authorization', `Bearer ${token}`)
        .then( response => {
          let user = response.body;
          console.log('(3) You are ', user);
          return user;
        });
      //  console.log('OH Boy');
    })
    .then( user => {
      //so at this point with our user info we need to create an account
      console.log('(4) Create Account ');

      // now go to model and create account / send the user object in the object we just now have and make the account
      return User.createFromOAuth(user);
      // after testing though we need to go to our db and delete the account to start fresh
      // db.users.remove({})
      // db.users.find().pretty()
      // console.log('STOP');
    })
    .then( loggedInUser => {
      console.log('(5) we did it');
      //this loggedInUser.generateToken() will put the token in the cookie area in chrome dev tools
      return loggedInUser.generateToken();
    })
    .catch(error => error);

};

export default {authorize};

