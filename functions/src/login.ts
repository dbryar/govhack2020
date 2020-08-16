import * as express from 'express';
import * as fn from './func';

// declare classes
const login = express();
const functions = require('firebase-functions');

// get key from ENV
const apiKey = functions.config().auth.key;


login.post('/', async (req:any,res:any) => {
  const user = req.body.email
  const pass = req.body.password
  const rst = req.body.returnSecureToken
  if(!user || !pass || !rst) {
    fn.respond(res, {code:401,message:`Request requires valid 'email' and 'password' values.`,trace:'GL.001'})
  } else {
    res.redirect(307, `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`);
  }
})

module.exports = login;