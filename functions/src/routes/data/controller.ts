/************
* Data CRUD *
************/


// import dependencies
import * as admin from 'firebase-admin';
import * as fn from '../../func';
import { get } from './get';
import { update } from './update';
//import { remove } from './remove';

// connect to firestore
const db = admin.firestore();

// declare classes
const express = require('express');
const router = express.Router();

// route globals
const docType = 'observations';

// CREATE an observation 
router.post('/:id', async (req:any,res:any) => {
  fn.isAuth(req,res,docType).then(async function() {
    update(db,req,res,docType)
    .catch(function(error:any){
      if(fn.isJSON(error)) {
        fn.respond(res, {code:400,message:`Error creating observation ${req.params.id}`,trace:'OC.002',data:JSON.parse(error.message)})
      } else {
        fn.respond(res, {code:500,message:`Error creating observation ${req.params.id}`,trace:'OC.002',data:error.message})
      }
    });
  })
  .catch(function(error:any) {
    if(fn.isJSON(error)) { 
      fn.respond(res, JSON.parse(error));
    } else {
      fn.respond(res, {code:401,message:`Unauthorized`,trace:'OC.001',data:error});
    }
  })
});


// RETRIEVE a single observation from a requested ID
router.get('/:id', async (req:any,res:any) => {
  fn.isAuth(req,res).then(async function() {
    get(db,req,res,docType)
    .catch(function(error:any){
      if(fn.isJSON(error)) {
        fn.respond(res, {code:400,message:`Error retrieving observation ${req.params.id}`,trace:'OR.002',data:JSON.parse(error.message)})
      } else {
        fn.respond(res, {code:500,message:`Error retrieving observation ${req.params.id}`,trace:'OR.002',data:error.message})
      }
    });
  })
  .catch(function(error:any) {
    if(fn.isJSON(error)) { 
      fn.respond(res, JSON.parse(error));
    } else {
      fn.respond(res, {code:401,message:`Unauthorized`,trace:'OR.001',data:error});
    }
  });
});
