var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');

var view_user_details_create = function(params , user) {
	var deferred = Q.defer();

	var User = global.registry.getSharedObject("models").User;

	var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["username", "password", "details"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
	else {
		debugger;
		User.find({ username: params.username }).exec().then(function(_users) {
			if(_users.length) {
				deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Such a username already exists. Please choose a different username."}, code:135 }));
			}
			else {
				// Create user from RAW params
				var user = new User(params);
				user.save();
				user.delete('password');
				deferred.resolve({ user: user });
			}
		});
	}

	return deferred.promise;
}

global.registry.register('view_user_details_create', {post:view_user_details_create});

var view_user_details_login = function(params) {
	var deferred = Q.defer();

	var User = global.registry.getSharedObject("models").User;
	var Token = global.registry.getSharedObject("models").Token;

	var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["username", "password"]);

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
	else {
		User.findOne({username:params.username}).exec().then(function(user) {
			debugger;
			if(!user) {
				deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Incorrect username/password"}, code:345 }));
			}
			if(params.password == user.password) {
				user.dateLastLogin = new Date();
				user.save(function(err) {
					deferred.reject(err);
				});

				var access_token = hat();
				var token = new Token();

				token.access_token = access_token;
				token.account = user._id;

				token.save(function(err) {
					deferred.reject(err);
				});

				user.delete('password');

				deferred.resolve({access_token:access_token, user: user});
			}
			else {
				deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Incorrect username/password"}, code:345 }));
			}
		});
	}

	return deferred.promise;
}

global.registry.register('view_user_details_login', {post:view_user_details_login});

var view_user_details_logout = function(params, user) {
	var deferred = Q.defer();

	var User = global.registry.getSharedObject("models").User;
	var Token = global.registry.getSharedObject("models").Token;

	var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token"]);

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}

	else {
		if(user) {
			user.dateLastLogout = new Date();
			user.save(function(err) {
				deferred.reject(err);
			});
		}

		Token.remove({ access_token : params.access_token }).exec().then(function(data) {
			deferred.resolve({loggedOut : true});
		}, function(err) {
			deferred.reject(err);
		});
	}
	return deferred.promise;
}

global.registry.register('view_user_details_logout', {post : view_user_details_logout});

var view_user_details_update = function(params, user) {
	var deferred = Q.defer();

	var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token", "data"]);

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}

	else {
		if(user) {
			if(params.data.password) {
				user.password = params.data.password;
			}
			user.dateUpdated = new Date();
			user.save(function(err) {
				deferred.reject(err);
			});

			user.delete('password');
			deferred.resolve({ user: user });
		}
		else {
			deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such user."}, code:109 }));
		}
	}

	return deferred.promise;
}

global.registry.register('view_user_details_update', {post : view_user_details_update});
