const express = require('express');
const path = require('path');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const dotenv = require("dotenv")
dotenv.config()
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_SID;
const twilioApiSecret = process.env.TWILIO_API_SECRET;

const identity = 'user';
const users = [
  {identity: "user1", role: "user"},
  {identity: "user2", role: "user"},
  {identity: "user3", role: "user"},
  {identity: "user4", role: "user"},
  {identity: "user5", role: "user"},
  {identity: "admin", role: "host"}
]


// Create Video Grant
const videoGrant = new VideoGrant({
  room: 'cool room',
});

// Create an access token which we will sign and return to the client,
// containing the grant we just created


const app = express(),
  bodyParser = require("body-parser");
  port = 3000;
  
app.use(async (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
});

app.get('/roomCID', async function(request, response) {
  var roomName = request.query['identity'];
  async function getConnectedParticipants(roomName) {

    var Twilio = require('twilio');
  
    var apiKeySid = process.env.TWILIO_API_SID;
    var apiKeySecret = process.env.TWILIO_API_SECRET;
    var accountSid = process.env.TWILIO_ACCOUNT_SID;
  
    var client = new Twilio(apiKeySid, apiKeySecret, {accountSid: accountSid});
  
    var list = await client.video.rooms(roomName)
                        .participants
                        .list({status: 'connected'});
    console.log(list)
    return list;
  }
  var connectedParticipants = await getConnectedParticipants(String(roomName));

  // print all connected participants
  console.log('connectedParticipants', connectedParticipants);
  response.send({
    connectedParticipants
  });
})
var cors = require('cors');
app.use(cors());
app.get('/token', async function(request, response) {
    var identity = request.query['identity'];

    if (!identity) {
      return response.status(400).send({
        body: "An identity is needed"
      })
    }
    
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      {identity: identity}
    );
    token.identity = identity;

    // Grant the access token Twilio Video capabilities.
    var grant = new VideoGrant();
    token.addGrant(grant);
    
    // Serialize the token to a JWT string
    console.log(token.toJwt());
  
    // Serialize the token to a JWT string and include it in a JSON response.
    response.send({
      identity: 'foo',
      token: token.toJwt()
    });
  })


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/build')));

app.get('/api/users', (req, res) => {
  console.log('api/users called!')
  res.json(users);
});

app.post('/api/user', (req, res) => {
  const user = req.body.user;
  console.log('Adding user:::::', user);
  users.push(user);
  res.json("user addedd");
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../my-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});