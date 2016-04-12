var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var multer = require('multer');

var init = require('./routes/init');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({}));

/*
 * Layer incharge of handling the HTTP calls immediately behind
 * expressJS
 */

 function makeRegLookupError( lookup ){
   return { description: lookup + ": shared object not found." , code: 500  }
 }

 var db = mongoose.connection;

 var settings = global.registry.getSharedObject("settings");
 db.open('mongodb://'+settings.db.mongo.username+":"+settings.db.mongo.password+"@"+settings.db.mongo.host+'/'+settings.db.mongo.name);

 app.get("/:object/:handler/:view", function( req, res ){
  var registry = global.registry;
  var logger = registry.getSharedObject("logger");

  var dataClass = req.params.object;
  var handler = req.params.handler;
  var view = req.params.view;

  if( !registry ){
    logger.err();   
  }

  var httpObjView = registry.getSharedObject( "view_" + dataClass + "_" + handler + "_" + view );
  if( !httpObjView ){
    res.send( JSON.stringify(registry.getSharedObject("view_error").makeError( makeRegLookupError( "http_" + dataClass + "_" + handler + "_" + view ) )) );
    res.end();
  }

  else {
    try{

      if(req.query.access_token) {
        global.registry.getSharedObject("live_session").get(req.query).then(function(user) {
          debugger;
          httpObjView.get( req.query , user).then( function( output ){
            debugger;
            if(output.result == false) {
              res.send(JSON.stringify(output));
            }
            else {
              res.send( JSON.stringify( {result:true, data:output} ) );
            }
          }, function( err ){
            throw err;
          }).done();
        }).done();
      }
      else {
        httpObjView.get( req.query ,req.user).then( function( output ){
          debugger;
          if(output.result == false) {
            res.send(JSON.stringify(output));
          }
          else {
            res.send( JSON.stringify( {result:true, data:output} ) );
          }
        }, function( err ){
          throw err;
        }).done();
      }
    } catch( err ){
      console.log("caught error : "+err);
      var error = registry.getSharedObject("view_error").makeError({ error:err, code:500 });
      res.send( error );
      res.end();
    }

  }
});

 app.post("/:object/:handler/:view", function( req, res ){
  var registry = global.registry;
  var logger = registry.getSharedObject("logger");

  var dataClass = req.params.object;
  var handler = req.params.handler;
  var view = req.params.view;

  debugger;

  if( !registry ){
    logger.err();   
  }

  var httpObjView = registry.getSharedObject( "view_" + dataClass + "_" + handler + "_" + view );
  if( !httpObjView ){
    res.send( JSON.stringify(registry.getSharedObject("view_error").makeError( makeRegLookupError( "http_" + dataClass + "_" + handler + "_" + view ) )) );
    res.end();
  }

  else {
    try{

      if(req.body.access_token) {
        global.registry.getSharedObject("live_session").get(req.body).then(function(user) {
          debugger;
          httpObjView.post( req.body, user).then( function( output ){
            debugger;
            if(output.result == false) {
              res.send(JSON.stringify(output));
            }
            else {
              res.send( JSON.stringify( {result:true, data:output} ) );
            }
          }, function( err ){
            throw err;
          }).done();
        }).done();
      }
      else {
        httpObjView.post( req.body ,req.user).then( function( output ){
          debugger;
          if(output.result == false) {
            res.send(JSON.stringify(output));
          }
          else {
            res.send( JSON.stringify( {result:true, data:output} ) );
          }
        }, function( err ){
          throw err;
        }).done();
      }
    } catch( err ){
      console.log("caught error : "+err);
      var error = registry.getSharedObject("view_error").makeError({ error:err, code:500 });
      res.send( error );
      res.end();
    }

  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
