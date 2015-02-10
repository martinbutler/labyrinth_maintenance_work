var http = require('http');
var querystring = require('querystring');

var rooms = []; // list all discovered rooms
var roomCount = 1; // total number of rooms discoverd
var roomRead = 0; // total number of rooms checked for writing
var challengeCode = []; // writings from rooms
var broken = []; // rooms with broken lights

// init http options
var options = {
  host: 'challenge2.airtime.com',
  port: 7182,
  path: '/start',
  headers: {
    'X-Labyrinth-Email': 'martin.fullstack@gmail.com'
  }
};

// called once to get starting room
// calls made to getWriting and getExits
callbackStart = function(response) {
  var str = '';
  response.on('data', function(chunk) {
    str += chunk;
  });
  response.on('end', function() {
    rooms.push(JSON.parse(str));
    getWriting(rooms[0].roomId);
    getExits(rooms[0].roomId);
  });
};

getExits = function(roomId) {
  options.path = '/exits?roomId='+ roomId;
  http.request(options, function(response) {
    var exits;
    response.on('data', function(chunk) {
      if(chunk) {
        exits = JSON.parse(chunk);
      }
    });
    response.on('end', function() {
      if(exits.exits) {
        roomCount += exits.exits.length;
        // get the roomIds for each exit
        for (var i = 0, len = exits.exits.length; i < len; i++) {
          checkRoomIdDiscovered("/move?roomId=" + roomId + "&exit=" + exits.exits[i]);
        }
      }
    });
  }).end();
};


checkRoomIdDiscovered = function(path) {
  options.path = path;
  http.request(options, function(response) {
    var roomId;
    response.on('data', function(chunk) {
      roomId = JSON.parse(chunk);
    });
    response.on('end', function() {
      // given the graph nature of this problem where the same
      // roomIds can seen from different rooms, we will validate
      // we have not seen them (roomIds) before
      var exists = false;
      for (var i=0, len = rooms.length; i<len; i++) {
        if(rooms[i].roomId === roomId.roomId) {
          exists = true;
        }
      }
      // if roomId was not previously discovered, save to rooms
      // array and get writing and exits for that roomId
      if (!exists) {
        rooms.push(roomId);
        getWriting(roomId.roomId);
        getExits(roomId.roomId);
      }
    });
  }).end();
};

getWriting = function(roomId) {
  options.path = '/wall?roomId='+ roomId;
  http.request(options, function(response) {
    var checkForWriting;
    response.on('data', function(chunk) {
      checkForWriting = JSON.parse(chunk);
    });
    response.on('end', function() {
      if(checkForWriting.writing === 'xx') {
        broken.push(roomId);
      } else {
        challengeCode[checkForWriting.order] = checkForWriting.writing;
      }
      roomRead++;
      sendTest();  // determine if post can be made
    });
  }).end();
};

sendTest = function() {
  // if the number of rooms equals the number of room
  // writings read, then send post request
  if(roomRead === roomCount) {
    // strip out all empty elements of the challengeCode array
    challengeCode = challengeCode.filter(function(el) {
      return el !== undefined;
    });
    options.method = 'POST';
    options.path = '/report';
    var body = JSON.stringify({
      'roomIds': broken,
      'challenge': challengeCode.join('')
    });
    callbackPost = function(response) {
      var str ='';
      response.on('data', function(chunk) {
        str += chunk;
      });
      response.on('end',function() {
        console.log('message: ', str);
      });
    };
    var post_req = http.request(options, callbackPost);
    post_req.write(body);
    post_req.end();
  }
};

// init - Let's get things started up in this code!
http.request(options, callbackStart).end();
