# Labyrinth Maintenance Work

You are a maintenance worker of a cyberspace labyrinth, tasked with creating a report of all the rooms in the labyrinth where the lights are no longer functional.  The labyrinth has the following HTTP Interface:

(all requests must contain the header X-Labyrinth-Email: <your email address>)

GET /start
// This tells you the room that you start in.
returns {
  roomId: '<roomId of first room>'
};

GET /exits?roomId=<roomId>
// This allows you to see which exits are available for this current room.
returns {
  exits: ['north', 'south', 'east', 'west']
}

GET /move?roomId=<roomId>&exit=<exit>
// This allows you to see what the roomId is through an exit.
returns {
  roomId: '<roomId of room connected by exit>'
}

GET /wall?roomId=<roomId>
// This allows you to see what the writing is on the wall for a particular room if the lights are working.
returns {
   writing: '<string>'
   order: <number>
}

// If the lights aren't working
returns {
  writing: 'xx'
  order: -1
}

POST /report
// Submit your maintenance report to the mothership. Because the mothership knows that some workers are lazy and untruthful, the mothership requires a challenge code that is made by concatenating all the 'writing' on the walls in lit rooms, in the order designated by 'order' from lowest to greatest.

body {
  roomIds: [array of room ids whose lights were broken],
  challenge: 'challenge code'
}

Note the /report expects a JSON-formatted post body.

The next steps will be apparent once the mothership approves your maintenance report.

Hint: If you get a 404, you probably are doing something wrong.
