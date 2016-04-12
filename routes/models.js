var mongoose = require("mongoose");

var Models = {};

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var userSchema = new Schema({
  username: String,
  role: {
    type: String,
    default: 'user'
  },
  password: String,
  dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
  dateLastLogin: { type: Date },
	dateLastLogout: { type: Date },
	details: {}
});
userSchema.plugin(deepPopulate, {});
Models.User = mongoose.model('User', userSchema);

Models.Token = mongoose.model('Token', new Schema({
	access_token: String,
	account: { type: Schema.Types.ObjectId, ref: 'User' }
}));

Models.Message = mongoose.model('Message', new Schema({
	by: { type: Schema.Types.ObjectId, ref: 'User' },
	text: String,
	timestamp: { type: Date, default: Date.now }
}));

var complaintSchema = new Schema({
	by: { type: Schema.Types.ObjectId, ref: 'User' },
	caption: String,
	messages: [ { type: Schema.Types.ObjectId, ref: 'Message' } ],
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
	collaborators: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});
complaintSchema.plugin(deepPopulate, {});
Models.Complaint = mongoose.model('Complaint', complaintSchema);

var discussionSchema = new Schema({
	caption: String,
	members: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
	messages: [ { type: Schema.Types.ObjectId, ref: 'Message' } ],
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now }
});
discussionSchema.plugin(deepPopulate, {});
Models.Discussion = mongoose.model('Discussion', discussionSchema);

Models.Thing = mongoose.model('Thing', new Schema({
	type: String,
	key: String,
	value: {}
}))

module.exports = Models;

global.registry.register("models", Models);
