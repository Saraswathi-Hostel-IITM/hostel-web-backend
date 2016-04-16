module.exports = {
	"db":{
		"mongo":{ "host":"localhost", "port":"27017", "name":"hostel_web", "username":"saras", "password":"wathi"}
	},
	"gcm":{
		"apiKey":"AIzaSyAS0FkXG-Bjogj4JA7tFb2z8_7zM5RwVS",
		"senderId":"253985857110"
	}
};

global.registry.register("settings", module.exports);
