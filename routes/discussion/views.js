var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');

var view_discussion_details_create = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["caption", "access_token"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    debugger;
    if(user && user.role === "Admin") {
      var discussion = new Discussion({caption: params.caption});
      if(discussion.approvedBy) delete discussion.approvedBy;
      discussion.members.push(user._id.toString());
      discussion.markModified("members");
      discussion.save();

      deferred.resolve({discussion: discussion});
    }
    else {
      deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
    }
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_create', { post: view_discussion_details_create });

var view_discussion_details_list = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var criteria = {};

  if(user.role !== "Admin") criteria["approvedBy"] = { "$exists": true };
  Discussion.find(criteria).exec().then(function(discussions) {
    discussions.deepPopulate('approvedBy', function(err, _discussions) {
      deferred.resolve(_discussions);
    });
  });
  return deferred.promise;
}

global.registry.register('view_discussion_details_list', { get: view_discussion_details_list });

var view_discussion_details_approve = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject("error_util");
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj){
    //throw error here
    deferred.resolve(errObj);
  }
  else if(user && user.role === "Admin") {
    Discussion.find({_id: params.id}).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such discussion."}, code:929}));
      }
      else if(!discussion.approvedBy) {
        discussion.approvedBy = user._id.toString();
        deferred.resolve(discussion);
      }
      else {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"This discussion is already approved."}, code:387}));
      }
    });
  }
  else {
    deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_approve', { post: view_discussion_details_approve });

var view_discussion_details_join = function(params, user){
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject("error_util");
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj){
    //throw error here
    deferred.resolve(errObj);
  }
  else{
    Discussion.findOne({_id: params.id}).exec().then(function(discussion){
      if(!discussion){
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such discussion group."}, code:452}));
      }
      else if(!user){
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
      }
      else{
        discussion.members.push(user._id.toString());
        discussion.markModified("members");
        discussion.save();
        deferred.resolve(discussion.members);
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_join', {post: view_discussion_details_join});

var view_discussion_details_message = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var Message = global.registry.getSharedObject("models").Message;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","id", "message"]);

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    Discussion.findOne({ _id: params.id }).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such discussion group."}, code:452 }));
      }
      else if(user && discussion.members.indexOf(user._id.toString()) == -1) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
      }
      else {
        var message = new Message(params.message);
        message.save();
        discussion.messages.push(message._id.toString());

        discussion.markModified("messages");

        discussion.save();
        deferred.resolve({message: message});
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_message', { post: view_discussion_details_message });

var view_discussion_details_remove = function(params, user){
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject("error_util");
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj){
    //throw error here
    deferred.resolve(errObj);
  }
  else{
    Discussion.findOne({_id: params.id}).exec().then(function(discussion){
      if(!discussion){
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such discussion group."}, code:452}));
      }
      else if(!user){
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
      }
      else {
        var idx = discussion.members.indexOf(user._id.toString());
        if(idx != -1) {
          discussion.members.splice(idx, 1);
          discussion.markModified("members");
          discussion.save();
        }
        deferred.resolve(discussion.members);
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_remove', {post: view_discussion_details_remove});

var view_discussion_details_get = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject("error_util");
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj){
    //throw error here
    deferred.resolve(errObj);
  }
  else if(!user) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
  }
  else {
    debugger;
    Discussion.findOne({_id: params.id}).exec().then(function(discussion) {
      var idx = discussion.members.indexOf(user._id.toString());
      debugger;
      if(idx != -1) {
        debugger;
        discussion.deepPopulate('members', function(err, discussion) {
          debugger;
          deferred.resolve(discussion);
        });
      }
      else {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_get', { get: view_discussion_details_get });
