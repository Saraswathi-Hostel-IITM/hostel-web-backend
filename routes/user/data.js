var registry = global.registry;
var Q = require("q");

var data_user = function( params ){
    // Get all relevant fields for the User object.
    var deferred = Q.defer();
    var User = registry.getSharedObject("models").User;
    var criteria = { _id: params.user_id };
    debugger;

    User.findOne( criteria ).exec().then( function( result ){
      debugger;
      deferred.resolve( result );
    }, function( err ){
      deferred.reject( err );
    });

    return deferred.promise;
  }

  global.registry.register('util_session', {get:data_user});

  var data_user_token = function( params ){
   var deferred = Q.defer();
   var access_token = params.access_token;
   var curr_token=null;

   debugger;

   var User = registry.getSharedObject("models").User;
   var Token = registry.getSharedObject("models").Token;

   Token.findOne( { access_token: access_token } ).exec()
   .then( function( token ){
    debugger;
    if(token) {
      curr_token=token.toJSON();
      return User.findOne({_id:curr_token.account}).exec();
    }
    else {
      return null;
    }
  }, function(err){
    deferred.reject( err )
  })
   .then( function( user ){
    deferred.resolve( user );
  }, function( err ){
    deferred.reject( err );
  });
   return deferred.promise;
 }

 global.registry.register('live_session',{get:data_user_token});

 var data_user_verify = function( user, linkedTo) {
  var deferred = Q.defer();

  debugger;

  if(!user) {
    debugger;
    deferred.resolve(false);
  }
  else if(user.linkedTo.toString() == linkedTo.toString()) {
    deferred.resolve(true);
  }
  else {
    deferred.resolve(false);
  }


  return deferred.promise;
}

global.registry.register('verify_session', {get:data_user_verify});