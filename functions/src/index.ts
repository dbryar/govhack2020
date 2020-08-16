// import dependencies
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fn from './func';
const cors = require('cors');

// init firebase
admin.initializeApp(functions.config().firebase);

// connect to firestore
//const db = admin.firestore();

console.log('API ready for requests');

// define Express.js as the main app
const app = express();
const main = express();

// Allow cross-origin requests from authorised domains
const allowlist = [
    'https://ready-aim-fire.firebaseapp.com',
    'https://ready-aim-fire.web.app'
];
const corsOptions = {
    origin: function(origin:any, callback:any) {
        if (allowlist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Invalid CORS domain'), false)
        }
    },
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'PATCH', 'OPTIONS'],
}

// define our endpoint base, and set the parser for JSON
main.use('/api/v1', app);
main.use(bodyParser.json());

// define an API login path
const login = require('./login');
main.use('/getToken', login);

// define test endpoint for confirming connectivity
app.get('/', (req:express.Request, res:express.Response) => { res.status(200).send('API ready') });
app.get('/ready/:reflection', (req:express.Request, res:express.Response) => { res.status(200).send(`API received ${req.params.reflection}`) });

// Add middleware to authenticate requests
const validateToken = async (req:express.Request, res:express.Response, next:any) => {
    // Check if request is authorized with Firebase ID token
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>');
      res.status(403).send('Unauthorized');
      return;
    }
  
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
      // No dice
      res.status(403).send('Unauthorized');
      return;
    }
  
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      // successfully validated the token;
      res.locals.user = decodedIdToken;
      next();
      return;
    } catch (error) {
      console.error('Error while verifying Firebase ID token:', error);
      fn.respond(res,{code:401,message:'Unauthorized',trace:error});
      return;
    }
};  

// Add Bearer Token cheking to all CORS enabled API requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(validateToken);

// process routes
const dataRouter = require('./routes/data/controller');
app.use('/readings', dataRouter);


// define the app as a cloud funtion called APIv1 (referenced in firebase.json)
export const APIv1 = functions.https.onRequest(main);
