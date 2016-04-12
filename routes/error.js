
// register error handlers.

var registry = global.registry;

var view_error = function(){
    this.production = true;
    this.makeError = function( params ){
        if( this.production ){
            return { result:false, err:{ code: params.code, description: params.error.message } };
        }else{
            return { result:false, err:{ code: params.code }, full_error: params.error };
        }
    }
}

registry.register("view_error", new view_error());

var error = {};

error.ERR_DESCRIPTION = {
	"102":"Wrong parameters for search",
	"420":"Insufficient parameters passed",
	"671":"Offer not in the vendor list",
	"210":"No such offer",
	"909":"Permission denied",
	"435":"Vendor IDs don't match",
	"619":"User not logged in",//try logining again
	"646":"User not found",//signup again
	"302":"No such checkin",
	"568":"Not an upcoming offer for you",
	"212":"Incorrect password",
	"845":"No such vendor",
	"204":"Cannot approve the checkin",
	"801":"Vendor doesn't exist",
	"802":"Offer doesn't exist",
	"709":"No such content"
};

error.err = function( res, code, desc ){
	res.end(JSON.stringify(
		{ result:false, err:{ code:code, description: ( desc || error.ERR_DESCRIPTION[code] || "No description" ) } }
		));
}

error.err_insuff_params = function( params, arr ) {
	var errobj = { params:[] };
	for(var i=0;i<arr.length;i++) {
		param = arr[i];
		if( !(params[param]) )
			errobj.params.push(param);
	}

	if( errobj.params.length ){
		return { result:false, err:{ code:420, missingParams: errobj.params } }
	}

	return;

}

global.registry.register("error_util", error);
