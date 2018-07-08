'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { getMaxListeners } from 'cluster';

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
});

// Before we save, hash the plain text password
userSchema.pre('save', function(next) {
  bcrypt.hash(this.password,10)
    .then(hashedPassword => {
      // Update the password for this instance to the hashed version
      this.password = hashedPassword;
      // Continue on (actually do the save)
      next();
    })
    // In the event of an error, do not save, but throw it instead
    .catch( error => {throw error;} );
});

// If we got a user/password, compare them to the hashed password
// return the user instance or an error
userSchema.statics.authenticate = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => error);
};

userSchema.statics.authorize = function(token) {
  let parsedToken = jwt.verify(token, process.env.SECRET || 'changeit');
  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => {
      // looked up their role and then all capabilities
      return user;
    })
    .catch(error => error);
};
////////////////////////////////////////
// 
userSchema.statics.createFromOAuth = function(incomingUser) {

  if(!incomingUser.email) {
    // Github object shows my email:null 
    incomingUser.email = 'notgiven@gmail.com';
  }

  // if(!incomingUser || !incomingUser.email) {
  if(!incomingUser) {
    return Promise.reject('Invalid Thing');
  }

  return this.findOne({email:incomingUser.email})
    .then( user => {
      if(!user) {
        throw new Error('User Not Found');
        // throwing this error forces us into the catch block below
      }
      console.log('Welcome Back');
      return user;
    })
    .catch( error => {
      console.log(error.status);
      let username = incomingUser.name;
      let password = 'n/a';
      return this.create({
        username:username,
        password:password,
        email:incomingUser.email,
      });
    });
};

////////////////////////////////////////

// Compare a plain text password against the hashed one we have saved
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

// Generate a JWT from the user id and a secret
userSchema.methods.generateToken = function() {
  return jwt.sign( {id:this._id}, process.env.SECRET || 'changeit' );
};

export default mongoose.model('users', userSchema);
