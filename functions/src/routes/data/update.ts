// import dependencies
import { Request, Response } from 'express';
import * as fn from '../../func';

export async function update(db:any, req:Request, res:Response, docType:string) {
    try {  

      // get id to process
      const docId = req.params.id;
      const timeNow = new Date();
        
      // get data from request body to process via loop over acceptable keys
      // better than const { name, title, photo, ... etc } = req.body;
      const data: { [key: string] :any } = {};
      const dataKeys = [ 'latitude', 'longitude', 'temperature', 'humidity', 'rainfall', 'interval', 'moisture', 'irradiance', 'co2', 'pm100', 'pm50', 'pm10', 'pm5', 'image'];
      dataKeys.forEach(
          (key:any) => {
              if(req.body[key] && fn.isClean(req.body[key] && fn.isValid(key,req.body[key]))) data[key] = req.body[key];
          }
      );
      data.modified = timeNow.toISOString();

      // check we have all data required
      if (!docId ) throw new Error(JSON.stringify({code:400,message:`ID not valid`,trace:'OU.003'}))
      if (docId.length !== 28 ) throw new Error(JSON.stringify({code:400,message:`ID not valid`,trace:'OU.004'}))
      if (data.length === 0 ) throw new Error(JSON.stringify({code:400,message:`Invalid  data`,trace:'OU.005',data:req.body}));
      
      try {

        // add the data to the Document
        await db.collection(docType)
          .doc(docId)
          .set(data, { merge: true });

        // respond to the client
        fn.respond(res, {
          data: data
        });

      } catch (error) {
        throw new Error(JSON.stringify({code:500,message:`Error writing to Document ${docId}`,trace:'OU.006'}));
      }
    } catch (error) {
      throw new Error(error);
    }

}