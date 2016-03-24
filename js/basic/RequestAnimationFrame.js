
/** 
 *  RequestAnimationFrame.js
 *  2014.12.12 by 404nan
 *   
 */

;
(function(window){

    var endTime = 0 ,
        vendorPrefix = [ 'moz', 'webkit'],
        length = vendorPrefix.length
    ;


    while( length-- ){

        window.requestAnimationFrame = window[vendorPrefix[length-1] + +'RequestAnimationFrame'] ;

        window.cancelAnimationFrame  = window[vendorPrefix[length-1] + +'CancelAnimationFrame'] || 
                                      
                                       window[vendorPrefix[length-1] + 'CancelRequestAnimationFrame'] ;

    }


    if (!window.requestAnimationFrame) {

        window.requestAnimationFrame = function( callback ) {

            var currTime = new Date().getTime(),
                /**
                 * 1s = 1000ms (remember that setInterval and setTimeout run on milliseconds)
                 * 1000ms / 60(fps) = 16.7ms (we'll round this to 17)
                 */
                
                timeToCall = Math.max(0, 16.7 - (currTime - endTime)) ,

                id = window.setTimeout(function() {

                    callback(currTime + timeToCall);

            }, timeToCall);

            endTime = currTime + timeToCall;

            return id;
        };
    }

    if (!window.cancelAnimationFrame) {

        window.cancelAnimationFrame = function(id) {

            clearTimeout(id);

        };
    }

    window.raf = window.requestAnimationFrame;

    window.caf = window.cancelAnimationFrame;

})(window)