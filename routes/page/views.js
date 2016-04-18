var Q = require("q");
var ObjectId = require("mongoose").Types.ObjectId;
var hat = require('hat');
var _ = require('lodash');

var view_page_post_create = function(params, user) {
  var deferred = Q.defer();

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","data","tag"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	} else if(!user || user.role !== "Admin" || ( user.permissions && user.permissions.indexOf('HANDLE_' + params.tag) == -1) ) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
  } else {
    var Post = global.registry.getSharedObject("models").Post;
    var Page = global.registry.getSharedObject("models").Page;

    Page.findOne({ tag: params.tag }).exec().then(function(page) {
      if(!page) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such page."}, code:994 }));
      } else {
        var post = new Post(params.data);
        post.save();
        page.posts.push(post._id.toString());
        page.markModified("posts");
        page.save();
        deferred.resolve(post);
      }
    });
  }

  return deferred.promise;
}

global.registry.register('view_page_post_create', { post: view_page_post_create });

var view_page_post_update = function(params, user) {
  var deferred = Q.defer();

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","data","tag","id"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	} else if(!user || user.role !== "Admin" || ( user.permissions && user.permissions.indexOf('HANDLE_' + params.tag) == -1) ) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
  } else {
    var Page = global.registry.getSharedObject("models").Page;
    var Post = global.registry.getSharedObject("models").Post;
    Page.findOne({ tag: params.tag }).exec().then(function(page) {
      if(!page) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such page."}, code:994 }));
      } else {
        var idx = page.posts.indexOf(params.id);
        if(idx == -1) {
          deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such post in this page."}, code:495 }));
        } else {
          Post.findOne({ _id: params.id }).exec().then(function(post) {
            if(!post) {
              deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such post."}, code:496 }));
            } else {
              post = _.merge(post, params.data);
              post.markModified("details");
              post.save();

              deferred.resolve(post);
            }
          });
        }
      }
    });
  }

  return deferred.promise;
}

global.registry.register('view_page_post_update', { post: view_page_post_update });

var view_page_thing_create = function(params, user) {
  var deferred = Q.defer();

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","data","tag"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	} else if(!user || user.role !== "Admin" || ( user.permissions && user.permissions.indexOf('HANDLE_' + params.tag) == -1) ) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
  } else {
    var Thing = global.registry.getSharedObject("models").Thing;
    var Page = global.registry.getSharedObject("models").Page;

    Page.findOne({ tag: params.tag }).exec().then(function(page) {
      if(!page) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such page."}, code:994 }));
      } else {
        var thing = new Thing(params.data);
        page.things.push(thing._id.toString());
        page.markModified("things");
        page.save();
        deferred.resolve(thing);
      }
    });
  }

  return deferred.promise;
}

global.registry.register('view_page_thing_create', { post: view_page_thing_create });

var view_page_thing_update = function(paras, user) {
  var deferred = Q.defer();

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","data","tag","id"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	} else if(!user || user.role !== "Admin" || ( user.permissions && user.permissions.indexOf('HANDLE_' + params.tag) == -1) ) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
  } else {
    var Page = global.registry.getSharedObject("models").Page;
    var Thing = global.registry.getSharedObject("models").Thing;
    Page.findOne({ tag: params.tag }).exec().then(function(page) {
      if(!page) {
        deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such page."}, code:994 }));
      } else {
        var idx = page.things.indexOf(params.id);
        if(idx == -1) {
          deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such thing in this page."}, code:493 }));
        } else {
          Thing.findOne({ _id: params.id }).exec().then(function(thing) {
            if(!thing) {
              deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"No such thing."}, code:494 }));
            } else {
              thing = _.merge(thing, params.data);
              thing.markModified("value");
              thing.save();

              deferred.resolve(thing);
            }
          });
        }
      }
    });
  }

  return deferred.promise;
}

global.registry.register('view_page_thing_update', { post: view_page_thing_update });

var view_page_details_get = function(params, user) {
  var deferred = Q.defer();

  var error = global.registry.getSharedObject('error_util');
	var errObj = error.err_insuff_params(params, ["access_token","tag"]);

	debugger;

	if(errObj) {
		//throw error here
		deferred.resolve(errObj);
	} else if(!user) {
    deferred.resolve(registry.getSharedObject("view_error").makeError({ error:{message:"Permission denied"}, code:909 }));
  } else {
    var Page = global.registry.getSharedObject("models").Page;

    Page.findOne({ tag: params.tag }).exec().then(function(page) {
      page.deepPopulate('things posts', function(err, _page) {
        deferred.resolve(_page);
      });
    });
  }

  return deferred.promise;
}

global.registry.register('view_page_details_get', { get: view_page_details_get });
