module.exports = {
	"db":{
		"mongo":{ "host":"localhost", "port":"27017", "name":"hostel_web", "username":"saras", "password":"wathi"}
	}
};

global.registry.register("settings", module.exports);
