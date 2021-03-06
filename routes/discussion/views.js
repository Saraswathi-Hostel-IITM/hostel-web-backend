var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');
var _ = require('underscore');

var view_discussion_details_create = function(params, user) {
  var deferred = Q.defer();

  var Discussion = global.registry.getSharedObject("models").Discussion;
  var User = global.registry.getSharedObject("models").User;

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["caption", "access_token"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	}
  else {
    debugger;
    if(user) {
      var discussion = new Discussion({caption: params.caption});
      if(discussion.approvedBy) delete discussion.approvedBy;
      discussion.members.push(user._id.toString());
      discussion.markModified("members");
      discussion.save();

      User.find({ role: "Admin" }).exec(function(users) {
        var gcm = global.registry.getSharedObject('util').gcm;
        var data = { discussion: discussion, fromUser: user, type: "DISCUSSION_CREATE" };
        gcm.gcmNotify(users, data);

        deferred.resolve({discussion: discussion});
      });
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
  var criteria = { state: "Active" };

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
      // console.log(criteria);
      Discussion.find(criteria).exec().then(function(discussions) {
        if(!discussions.length) {
          deferred.resolve(discussions);
        }
        else {
          debugger;
          var plist = [];

          for(var i=0; i < discussions.length; ++i) {
            // NOTE: Populating "by" user in discussion ( members[0] )
            discussions[i].by = discussions[i].members[0];
            if(discussions[i]['approvedBy']) {
              var p = discussions[i].deepPopulate('approvedBy by');
              plist.push(p);
            }
            else {
              plist.push(discussions[i].deepPopulate('by'));
            }
          }
          debugger;
          Q.all(plist).then(function(_discussions) {
            arr = _.partition(_discussions, function(ele) {
              return ( ele.members.indexOf(user._id.toString()) != -1 )
            });
            var obj = { 'joined': arr[0], 'unjoined': arr[1] };
            deferred.resolve(obj);
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
    Discussion.findOne({_id: params.id, state: "Active"}).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such discussion."}, code:929}));
      }
      else if(discussion.status !== "Approved") {
	      discussion.status = "Approved";
        discussion.approvedBy = user._id.toString();
        discussion.save();

        discussion.deepPopulate('members', function(err, _discussion) {
          var gcm = global.registry.getSharedObject('util').gcm;
          var data = { discussion: _discussion, approvedBy: user, type: "DISCUSSION_APPROVE" };
          gcm.gcmNotify(_discussion.members, data);
          deferred.resolve(_discussion);
        });
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
    Discussion.findOne({_id: params.id, state: "Active"}).exec().then(function(discussion){
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
    Discussion.findOne({ _id: params.id, state: "Active" }).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such discussion group."}, code:452 }));
      }
      else if(!user || discussion.status !== "Approved" || discussion.members.indexOf(user._id.toString()) == -1) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
      }
      else {
        var message = new Message(params.message);
        message.save();
        discussion.messages.push(message._id.toString());
        discussion.markModified("messages");
        discussion.save();
        discussion.deepPopulate('members', function(err, _discussion) {
          var gcm = global.registry.getSharedObject('util').gcm;
          var data = { message: message, fromUser: user, type: "DISCUSSION_MESSAGE" };

          // The user who sent the message should not receive the notification
          var members  = _.filter(_discussion.members, function(ele) {
            return ( ele._id.toString !== user._id.toString() )
          });

          gcm.gcmNotify(members, data);
          deferred.resolve({ message: message });
        });
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_message', { post: view_discussion_details_message });

var view_discussion_details_exit = function(params, user){
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
    Discussion.findOne({_id: params.id, state: "Active"}).exec().then(function(discussion){
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

global.registry.register('view_discussion_details_exit', {post: view_discussion_details_exit});

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
    Discussion.findOne({_id: params.id, state: "Active"}).exec().then(function(discussion) {
      if(!discussion) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"No such discussion."}, code:929}));
      }
      else {
        var idx = discussion.members.indexOf(user._id.toString());
        debugger;
        if(idx != -1) {
          debugger;
          discussion.deepPopulate('members messages messages.by approvedBy', function(err, discussion) {
            debugger;
            deferred.resolve(discussion);
          });
        }
        else {
          deferred.resolve(registry.getSharedObject("view_error").makeError({error:{message:"Permission denied"}, code:909}));
        }
      }
    });
  }
  return deferred.promise;
}

global.registry.register('view_discussion_details_get', { get: view_discussion_details_get });
