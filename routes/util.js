var filterParams = function(params, arr) {
	var obj = {};
	for(var i=0;i<arr.length;i++) {
		if(params[arr[i]]) {
			obj[arr[i]] = params[arr[i]];
		}
	}
	return obj;
}

var filterObjectStrict = function(raw, fields) {
  var obj = {};
  var missingParams = [];

  for(var i=0; i<fields.length; i++) {
    var field = fields[i];
    if(raw[field]) {
      obj[field] = raw[field];
    }
    else {
      missingParams.push(field);
    }
  }

  if(missingParams.length) {
    return {result:false, err:{code:420, message:"Insufficient parameters passed.", missingParams:missingParams}};
  }
  else {
    return {result:true, data:obj};
  }
}

var assign_keys = function (obj_ori, obj_in, key) {
  debugger;
  if(typeof obj_in[key] == 'object') {
    if(!obj_ori[key]) {
      obj_ori[key] = {};
    }
    for(k in obj_in[key]) {
      assign_keys(obj_ori[key], obj_in[key], k);
    }
  }
  else if(obj_in[key]) {
    obj_ori[key] = obj_in[key];
  }
}


function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

var settings = require('./settings');
var gcm = require('node-gcm-service');

var gcmNotify = function(users, data){
    var regIds = [];
    users.forEach(function(current, pos, array) {
        var gcmId = current.details.properties.gcmId;
        regIds.push(gcmId);
    });
    var message = new gcm.Message({
        collapse_key: 'saras_hostel_iitm',
        delay_while_idle: true,
        data: data
    });
    var sender = new gcm.Sender();
    sender.setAPIKey(settings.gcm.apiKey);
    sender.sendMessage(message.toString(), regIds, true, function (err, res) {
      console.log(res);
			console.log("Sent to " + regIds);
    	if(err) console.log(err);
    });
}

global.registry.register('util', {filterParams:filterParams, filterObject:filterObjectStrict, assign_keys:assign_keys
, escapeRegExp:escapeRegExp, replaceAll:replaceAll, gcm: { gcmNotify: gcmNotify }});
