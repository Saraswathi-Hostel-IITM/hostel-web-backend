var mongoose = require("mongoose");

var Models = {};

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

Models.User = mongoose.model('User', new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
  dateLastLogin: { type: Date },
	dateLastLogout: { type: Date },
	details: {}
}));

Models.Token = mongoose.model('Token', new Schema({
	access_token: String,
	account: { type: Schema.Types.ObjectId, ref: 'User' }
}));

Models.Message = mongoose.model('Message', new Schema({
	by: { type: Schema.Types.ObjectId, ref: 'User' },
	text: String,
	timestamp: { type: Date, default: Date.now }
}));

Models.Complaint = mongoose.model('Complaint', new Schema({
	by: { type: Schema.Types.ObjectId, ref: 'User' },
	caption: String,
	messages: [ { type: Schema.Types.ObjectId, ref: 'Message' } ],
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
	collaborators: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
}));

Models.Discussion = mongoose.model('Discussion', new Schema({
	caption: String,
	members: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
	messages: [ { type: Schema.Types.ObjectId, ref: 'Message' } ],
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now }
}));

Models.Thing = mongoose.model('Thing', new Schema({
	type: String,
	key: String,
	value: {}
}))

module.exports = Models;

global.registry.register("models", Models);
