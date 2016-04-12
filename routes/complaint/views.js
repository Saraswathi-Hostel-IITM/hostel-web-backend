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
  var criteria = {state: 'Active'};

  if(user && user.role !== "Admin") criteria["approvedBy"] = { "$exists": true };
  Complaint.find(criteria).exec().then(function(complaints) {
    complaints.deepPopulate('approvedBy', function(err, _complaints) {
      deferred.resolve(_complaints);
    });
  });

  return deferred.promise;
}

global.registry.register('view_complaint_details_list', { get: view_complaint_details_list });

var view_complaint_details_approve = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject("error_util");
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj){
    //throw error here
    deferred.resolve(errObj);
  }
  else if(user && user.role === "Admin") {
    Complaint.find({_id: params.id, state: "Active"}).exec().then(function(complaint) {
      if(!complaint) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such complaint."}, code:929}));
      }
      else if(!complaint.approvedBy) {
        complaint.approvedBy = user._id.toString();
        deferred.resolve(complaint);
      }
      else {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"This complaint is already approved."}, code:387}));
      }
    });
  }
  else {
    deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
  }
  return deferred.promise;
}

global.registry.register('view_complaint_details_approve', { post: view_complaint_details_approve });

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
    Complaint.findOne({ _id: params.id }).exec().then(function(complaint) {
      if(!complaint) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such complaint."}, code:452 }));
      }
      else if(complaint.by != user._id && complaint.collaborators.indexOf(user._id) == -1) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
      }
      else {
        var message = new Message(params.message);
        message.save();
        complaint.messages.push(message._id.toString());

        complaint.markModified("messages");

        complaint.save();
        deferred.resolve({message: message});
      }
    });
  }

  return deferred.promise;
}

var view_complaint_details_get = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;
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
    Complaint.findOne({_id: params.id, state: "Active"}).exec().then(function(complaint) {
      complaint.deepPopulate('members', function(err, complaint) {
          debugger;
          deferred.resolve(complaint);
        });
      complaint.deepPopulate('messages', function(err, complaint) {
          debugger;
          deferred.resolve(complaint);
        });
    });
  }
  return deferred.promise;
}

global.registry.register('view_complaint_details_get', { get: view_complaint_details_get });

var view_complaint_details_delete = function(params, user) {
  var deferred = Q.defer();

  var Complaint = global.registry.getSharedObject("models").Complaint;

  var error = global.registry.getSharedObject('error_util');
  var errObj = error.err_insuff_params(params, ["access_token","id"]);

  if(errObj) {
    //throw error here
    deferred.resolve(errObj);
  }
  else {
    Complaint.findOne({_id: params.id, state: "Active"}).exec().then(function(complaint) {
      if(!complaint) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such complaint."}, code:452 }));
      }
      else if(complaint.by != user._id && complaint.collaborators.indexOf(user._id) == -1) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
      }
      else {
        complaint.state = "Inactive";
        complaint.save();
        deferred.resolve({complaint: complaint});
      }
    });
  }

  return deferred.promise;
}

global.registry.register('view_complaint_details_message', { post: view_complaint_details_message });
