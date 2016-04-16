var http = require('http');
var data = require('./things.js');
var qs = require('qs');

for( d in data ) {
  var options = {
    host: '54.169.0.11',
    port: 8000,
    path: '/thing/details/create?' + qs.stringify({access_token: "e5c6de0b282780366f4ed45bdff01240", data: data[d]})
  };
  http.get(options, function(resp){
    resp.on('data', function(chunk){
      console.log("DONE");
    });
  }).on("error", function(e){
    console.log("Got error: " + e.message);
  });
}
