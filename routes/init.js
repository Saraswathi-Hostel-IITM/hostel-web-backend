
// Load the registry( for complete service abstraction ) and messaging ( for event-driven classes ).
var loadReg = require("./registry"); 

var fs = require("fs");

var mongoose = require("mongoose");

var requireAllFiles = function( normalizedPath , modules, prefix) {
	console.log( "REQUIRING DIRECTORY: " + normalizedPath );
	fs.readdirSync(normalizedPath).forEach(function(child) {
		var normalizedPathChild = normalizedPath + "/" + child;

		if( (child + "").indexOf( ".js" ) == -1 ){
			//console.log("Ignoring: " + child);
			return;
		}

		if(fs.lstatSync(normalizedPathChild).isDirectory()) {
			var childCapitalised = child.charAt(0).toUpperCase() + child.slice(1);
			/*modules = */
			requireAllFiles(normalizedPathChild, modules, prefix + childCapitalised);
		}
		else {
			/*var var_name = child.split(".")[0];
			var_name = prefix.charAt(0).toLowerCase() + prefix.slice(1) + var_name.charAt(0).toUpperCase() + var_name.slice(1);

			modules[var_name] = */
			require(normalizedPathChild);
			console.log("LOADED Module : " + normalizedPathChild);
		}
	});
}

var normalizedPath = require("path").join(__dirname, "");

var requireDirectory = require('require-directory');
var routes = requireDirectory(module, './');

requireAllFiles(normalizedPath, [], "");

module.exports = {};