// import dependencies
import { Request, Response } from 'express';
import * as fn from '../../func';

export async function get(db:any, req:Request, res:Response, docType:String) {
    try {  

      // get id to process
      const docId = req.params.id;

      // check we have all data required
      if (!docId ) throw new Error(JSON.stringify({code:400,message:`ID not valid`,trace:'OR.003'}))
      if (docId.length !== 28 ) throw new Error(JSON.stringify({code:400,message:`ID not valid`,trace:'OR.004'}))

      // get object from the DB
      const obs = await db.collection(docType).doc(docId).get();

      // respond if not found
      if (!obs.exists){
        throw new Error(JSON.stringify({code:400,message:`ID not valid ${docId}`,trace:'OR.005'}));
      }

      // else respond to the client
      fn.respond(res, {
        data: obs.data()
      });

    } catch (error) {
      throw new Error(error);
    }
}