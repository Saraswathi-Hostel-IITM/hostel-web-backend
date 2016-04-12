var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');

var view_discussions_details_create = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["caption"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    debugger;
    if(user.role === "Admin") {
      var discussion = new Discussion({caption: caption});
      discussion.members.push(user._id.toString());
      discussion.markModified("members");
      discussion.save();

      deferred.resolve({discussion: discussion});
    }
    else {
      deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
    }
  }
}

global.registry.register('view_discussions_details_create', { post: view_discussions_details_create });

var view_discussions_details_list = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  Discussion.find().exec().then(function(discussions) {
    deferred.resolve(discussions);
  });
}

global.registry.register('view_discussions_details_list', { get: view_discussions_details_list });

var view_discussions_details_message = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var Message = global.registry.getSharedObject("models").Message;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["id", "message"]);

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    Discussion.findOne({ _id: params.id }).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such discussion group."}, code:452 }));
      }
      else if(discussion.members.indexOf(user._id.toString()) == -1) {
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
}

global.registry.register('view_discussions_details_message', { post: view_discussions_details_message });
