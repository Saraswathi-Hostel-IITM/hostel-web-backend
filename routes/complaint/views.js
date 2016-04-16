var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');
var _ = require('underscore');

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
    if(user) {
      var desc = params.description;
      delete params.access_token;
      delete params.description;
      var complaint = new Complaint(params);
      var message = new Message({by: user._id.toString(), text: desc});
      message.save();
      complaint.messages.push(message._id.toString());
      complaint.by = user._id.toString();
      complaint.save();

      complaint.deepPopulate('collaborators', function(err, _complaint) {
          debugger;
          var gcm = global.registry.getSharedObject('util').gcm;
          var data = { complaint: _complaint, fromUser: user, type: "COMPLAINT_CREATE" };
          gcm.gcmNotify(complaint.collaborators, data);
          deferred.resolve({ complaint: _complaint });
      });
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

  var error = global.registry.getSharedObject('error_util');
  var errObj = error.err_insuff_params(params, ["access_token"]);

  debugger;

  if(errObj) {
    //throw error here
    deferred.resolve(errObj);
  }

  else{
    if(user){
      // if(user.role !== "Admin") criteria["approvedBy"] = { "$exists": true };
      debugger;
      Complaint.find(criteria).exec().then(function(complaints) {
        debugger;
        if(!complaints.length) {
          debugger;
          deferred.resolve(complaints);
        }
        else {
          debugger;
          var plist = [];
          for(var i=0; i < complaints.length; ++i) {
            if(complaints[i]['approvedBy']) {
              var p = complaints[i].deepPopulate('approvedBy');
              plist.push(p);
            }
          }
          debugger;
          Q.all(plist).then(function(_complaints) {
            deferred.resolve(_complaints);
          });
        }
      });
    }
    else{
      deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
    }
  }

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
    Complaint.findOne({_id: params.id, state: "Active"}).exec().then(function(complaint) {
      if(!complaint) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such complaint."}, code:929}));
      }
      else if(complaint.status !== "Approved") {
	      complaint.status = "Approved";
        complaint.approvedBy = user._id.toString();
        complaint.save();

        complaint.deepPopulate('by', function(err, _complaint) {
          var gcm = global.registry.getSharedObject('util').gcm;
          var data = { complaint: _complaint, approvedBy: user, type: "COMPLAINT_APPROVE" };
          gcm.gcmNotify([_complaint.by], data);

          deferred.resolve(_complaint);
        });
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
      else if(!user || complaint.status !== "Approved" || complaint.by.toString() !== user._id.toString() || complaint.collaborators.indexOf(user._id) == -1) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
      }
      else {
        var message = new Message(params.message);
        message.by = user._id.toString();
        message.save();
        complaint.messages.push(message._id.toString());

        complaint.markModified("messages");

        complaint.save();
        complaint.deepPopulate('by collaborators', function(err, _complaint) {
          var gcm = global.registry.getSharedObject('util').gcm;
          var data = { message: message, fromUser: user, type: "COMPLAINT_MESSAGE" };

          var members = _.complaint.collaborators;
          members.push(_complaint.by);

          // The user who sent the message should not receive the notification
          var _members  = _.filter(members, function(ele) {
            return ( ele._id.toString !== user._id.toString() )
          });

          gcm.gcmNotify(_members, data);

          deferred.resolve({ message: message });
        });
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
      complaint.deepPopulate('collaborators messages messages.by approvedBy', function(err, complaint) {
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

global.registry.register('view_complaint_details_delete', { post: view_complaint_details_delete });
