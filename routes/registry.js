
/*
 * Implements a Shared Object registry for complete
 * separation of responsibilities
 * It is put into the globals variable so that any piece of code can
 * at any time access any module through the registry
 */
var Registry = function(){
    this.registry = {};

    this.forwards = {};

    this.register = function( key, object ){
        this.registry[key] = object;
        console.log("REGISTERED : " + key + " -> " + object);
    }

    this.getSharedObject = function( key ){
        if( !key ) {
            console.log("Unregistered Key : " + key);
            return null;
        }

        console.log('GOT : ' + key);

        if( this.registry[key] )
            return this.registry[key];
        else
            return this.getSharedObject( this.forwards[key] );
    }
    
    this.forwardObject = function( src, dest ){
        this.forwards[src] = dest;
    }
}

global.registry = new Registry();

/*
 * A publisher subscriber framework for further 
 * separation of responsibilities.
 * 
 * subscribe( key, callback ) - subscribes on a key.
 * publish( key, message ) - publishes a message on a key. 
 */

var MessageControl = function(){
    this.registry = {};

    this.subscribe = function( key, callback ){
        this.ensure( key );
        this.registry[key].push(callback);
    }
    this.publish = function( key, message ){

        this.ensure( key );
        
        var callbacks = this.registry[key];
        for( var i = 0; i < callbacks.length; i++ ){
            callbacks[i]( key, message );
        }

    }
    
    this.ensure = function( key ){
        if( !this.registry[key] )
            this.registry[key] = [];
    }

}

global.messaging = new MessageControl();