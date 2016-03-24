/**
 *   跑马灯效果
 *   @require Zepto
 *   @author 404nan
 *   @mail hello@404nan.com
 *   两种效果  CSS3和js ，js没有复制dom做了直接实时调换顺序
 */

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

 })(window);

;(function(window,$){
    $.fn.ListDroll = function( opt ){
        this.each(function(){
            var newL = new $.ListDroll( this , opt );
            newL.init();
        });

        return this;
    };

    $.ListDroll = function( elem , opt ){

        this.elem = elem;
        this.opt = {
            outTime : 200,
            type : 'css3Roll',//  css3Roll , jsRoll 选择js滚动或者css3效果滚动,
            animateDuration : '.6',
            isLoop  : true
        } ;

        $.extend( this.opt , opt );

        this.count  = 0;
    };

    $.ListDroll.prototype = {

        init:function(){
            var _this = this ,
                _self = $( this.elem )
            ;
                        _self.addClass('listDroll_list');
            this._li = _self.find('li') ;
            this._ul = _self.find('ul') ;
            this._uh = this._ul.height()   ;
            this._lh = this._li.height()   ;
            this._ih = this._li.eq(0).height() ;
            this.len = this._li.length ;
            this._t = _this.opt.isLoop ? parseInt( '-'+this._lh ) : parseInt( '-'+ this._uh );

            this.move();
        },
        move:function(){
            if( this.opt.type == 'css3Roll' ){
                this.css3Roll();
            }else if( this.opt.type == 'jsRoll' ) {
                this.jsRoll();
            }else if( this.opt.type == 'translate' ){
                                this.translate();
                        }

        },
        // 过渡动画
        animateDuration: function (target, duration ){
            var _duration = (duration || 0 ) +'s';
            $(target).css({
                'transition-duration': _duration,
                '-moz-transition-duration': _duration,
                '-webkit-transition-duration': _duration
            });
        },
        translate:function(){
            var _this = this ,
                _self = $( this.elem ),
                _li = _self.find('ul li').eq(0)
            ;

            if(  _this.opt.isLoop && _this.count <= _this._t-6 ){

                  _this._ul.append( _li );
                  _this.count = 0;
            }

                        _this._ul[0].style.webkitTransform = "translateZ(0) translateX(0) translateY(" + _this.count + "px)";

                        raf(function(){

                            _this.time = setTimeout(function(){

                                    _this.count-- ;

                                    if( !_this.opt.isLoop && _this.count <= _this._t-6){
                                            return;
                                    }
                                    _this.translate();

                            }, _this.opt.outTime );
                        })
        },
                jsRoll:function(){
            var _this = this ,
                _self = $( this.elem ),
                _li = _self.find('ul li').eq(0)
            ;

            if(  _this.opt.isLoop && _this.count <= _this._t-6 ){

                  _this._ul.append( _li );
                  _this.count = 0;
            }

            _this._ul.css({
                top: _this.count
            });
                        raf(function(){
                _this.time = setTimeout(function(){

                    _this.count-- ;

                    if( !_this.opt.isLoop && _this.count <= _this._t-6){
                        return;
                    }
                    _this.jsRoll();

                }, _this.opt.outTime );
                        });
        },
        css3Roll:function(n){
            var _this = this ,
                _self = $( this.elem ) ,
                _cloneUl = _this._ul.clone() ,
                target1 = _this._ul ,
                target2 = _cloneUl
            ;

            _self.append( _cloneUl );
            _cloneUl.css({ 'top': _this._ih });
            _this.animateDuration( _cloneUl );

            (function callback(n , i){
                var _arguments = arguments ,
                    n = n || 0 ,
                    i = i || 0
                ;

                if( !_this.opt.isLoop && n === _this.len-1){
                    return;
                }

                if( i ){
                    target1 = _this._ul ;
                    target2 = _cloneUl ;
                }else{
                    target1 = _cloneUl ;
                    target2 = _this._ul ;
                }

                if( n == _this.len - 1 ){
                    target1.css({ 'top': _this._ih })
                    _this.animateDuration( target1 );
                }
                if( n === _this.len ) {
                    target2.css({ 'top': -_this.len *_this._ih });
                    target1.css({ 'top': 0 });
                    _this.animateDuration( target1 , _this.opt.animateDuration);
                   if(i){
                     i = 0 ;
                   }else{
                     i = 1;
                   }
                    n = 0;
                }else{
                    _this.animateDuration( target2 , _this.opt.animateDuration);
                    target2.css({ 'top':-n*_this._ih });
                };
                                raf(function(){
                    setTimeout(function(){
                        n++;
                        callback(n , i );
                    }, _this.opt.outTime );
                                });
            })();
        }

    }

})(window,this.jQuery || this.Zepto);
