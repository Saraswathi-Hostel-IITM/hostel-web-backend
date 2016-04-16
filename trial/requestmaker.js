var http = require('http');
var data = require('./things.js');
var qs = require('qs');

for( d in data ) {
  var options = {
    host: 'localhost',
    port: 4000,
    path: '/thing/details/create?' + qs.stringify({data: data[d]})
  };
  http.get(options, function(resp){
    resp.on('data', function(chunk){
      console.log("DONE");
    });
  }).on("error", function(e){
    console.log("Got error: " + e.message);
  });
}
