import { Request, Response } from 'express';

const Filter = require('bad-words'), filter = new Filter();


// API responder to structure response messages consistently
export function respond(res:Response, msg:any) {
  const debug = true; // hard coded for development/production
  let log = false;
  if(msg.code || msg.data) {
    const json: {[key: string]: any} = {};
    if(msg.code >= 300) {
      // log errors to the console
      log = true;
      json.status = `error`;
    } else {
      json.status = `success`;
    }
    if(msg.trace && debug) json.trace = `Response ID: ${msg.trace}`;
    json.message = msg.message;
    if(msg.data) json.data = msg.data;
    if(msg.code) {
      if(msg.code === 204) {
        res.status(204).end();
      } else {
        if(log) console.log(JSON.stringify(json,null,2))
        res.status(msg.code).json(json);
      }
    } else {
      res.status(200).json(json);        
    }
  } else {
    if(log) console.log(JSON.stringify({code:500,message:`Error ${msg}`},null,2))
    res.status(500).json({message: msg});
  }
  return res;
}



// check submitted token has access to the document
export async function isAuth(req:Request,res:Response,docType:String = '') {
  // get the id of the endpoint document being requested
  const docId = req.params.id;
  // if no docType is specified, we are reading, not writing to the document
  const readOnly = (docType === '')?true:false;
  // get the authorised user UID
  const claims = res.locals.user;

  try {
    // inital error checking
    if (!readOnly) {
      if (!docId) throw new Error(JSON.stringify({code:400,message:`ID not valid`,trace:'GA.001'}));
      if (docId.length !== 18 && docId.length !== 20 && docId.length !== 28) throw new Error(JSON.stringify({code:400,message:`ID not valid ${docId}`,trace:'GA.002'}));
    }
    if (!readOnly && (claims.uid !== docId)) {
      // not readOnly
      // not the owner of the document
      const accessClaims = claims[docType.toLowerCase()]
      if(accessClaims !== undefined) {
        if(accessClaims.includes(docId)) {
          // write enabled for that docType in token claims
          return res;
        }
      }
      // not write enabled for that docType in token claims
      throw new Error(JSON.stringify({code:401,message:`Unauthorized`,trace:'GA.003'}));
    } else {
      return res;
    } 
  } catch (error) {
    if(isJSON(error.message)) {
      return respond(res, JSON.parse(error.message));
    } else {
      return respond(res, error.message);
    }
  }
}



// simple Boolean function to test JSON validity submitted to endpoints
export function isJSON(json:string) {
  try {
    JSON.parse(json);
    return true;
  } catch (err) {
    return false;  
  }
}



// *** TO DO *** validation and reformatting of user entered data based on key name
// use regex or something (e.g. detect /email/i check for /^\S.\@\S{2,}\.{2,}/i)
export function isValid(key:string, data:any) {
  return data;
}



// *** TO DO *** profanity filter of user entered data 
export function isClean(data:any) {
  if(filter.isProfane(data)) return false;
  return true;
}

