var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');

var view_thing_details_create = function(params, user) {
  var deferred = Q.defer();

  var Thing = global.registry.getSharedObject("models").Thing;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token", "data"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    debugger;
    if(user && user.role === "Admin") {
      var thing = new Thing(params.data);
      deferred.resolve(thing);
    }
    else {
      deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
    }
  }
  return deferred.promise;
}

global.registry.register('view_thing_details_create', { post: view_thing_details_create });

var view_thing_details_get = function(params) {
  var deferred = Q.defer();

  var Thing = global.registry.getSharedObject("models").Thing;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["criteria"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    Thing.find(params.criteria).exec().then(function(things) {
      deferred.resolve(things);
    });
  }

  return deferred.promise;
}

global.registry.register('view_thing_details_get', { get: view_thing_details_get });
