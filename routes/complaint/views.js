var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');

var view_complaint_details_create = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;
  var Message = global.registry.getSharedObject("models").Message;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","caption","description","collaborators"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    debugger;
    if(user){
      var desc = params.description;
      delete params.access_token;
      delete params.description;
      var complaint = new Complaint(params);
      var message = new Message(desc);
      message.save();
      complaint.messages.push(message._id.toString());
      complaint.by = user._id.toString();
      complaint.save();

      deferred.resolve({complaint: complaint});
    }
    else {
      deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
    }
  }

  return deferred.promise;
}

global.registry.register('view_complaint_details_create', { post: view_complaint_details_create });

var view_complaint_details_list = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;
  Complaint.find().exec().then(function(complaints) {
    deferred.resolve(complaints);
  });

  return deferred.promise;
}

global.registry.register('view_complaint_details_list', { get: view_complaint_details_list });

var view_complaint_details_message = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;
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

  return deferred.promise;
}

global.registry.register('view_complaint_details_message', { post: view_complaint_details_message });
