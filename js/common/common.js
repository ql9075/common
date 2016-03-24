
/* common.js  集合常用方法
 * @404nan
 * 兼容性适用移动端
 */


// 常用方法
window.G = {
	//对象扩展
	/* 
	 * @param {Object} target 目标对象。 
	 * @param {Object} source 源对象。 
	 * @param {boolean} deep 是否复制(继承)对象中的对象。 
	 * @returns {Object} 返回继承了source对象属性的新对象。 
	 */ 
	extend:function(target, /*optional*/source, /*optional*/deep) { 
	    target = target || {}; 
	    var sType = typeof source, i = 1, options; 
	    if( sType === 'undefined' || sType === 'boolean' ) { 
	        deep = sType === 'boolean' ? source : false; 
	        source = target; 
	        target = this; 
	    } 
	    if( typeof source !== 'object' && Object.prototype.toString.call(source) !== '[object Function]' ) 
	        source = {}; 
	        while(i <= 2) { 
	            options = i === 1 ? target : source; 
	            if( options != null ) { 
	                for( var name in options ) { 
	                    var src = target[name], copy = options[name]; 
	                    if(target === copy) 
	                    continue; 
	                    if(deep && copy && typeof copy === 'object' && !copy.nodeType) 
	                    target[name] = this.extend(src || 
	                    (copy.length != null ? [] : {}), copy, deep); 
	                    else if(copy !== undefined) 
	                    target[name] = copy; 
	                } 
	            } 
	            i++; 
	        } 
	    return target; 
	},
	
	/* 获取随机数
	 * @param {Number} 目标范围长度
	 */
	randomNum:function(length){
		return Math.floor(Math.random()*length);
	},
	//时间戳
	timestamp : function(){
		return new Date().getTime()+parseInt(Math.random()*100);
	},
	//jsonp
	jsonp:function(o){
		
		var _head = o.target || document.getElementsByTagName('head')[0],
	 		_s = document.createElement('script'),
	 		_urlSever = o.server || 'https://m.wangyin.com/open/ticketSignature',
	 		_url = o.isEncode ? encodeURIComponent( o.url ) : o.url  
	 	;

	 		_s.src = _urlSever +'?url='+_url+'&callback='+o.callbackFn+ (o.param ? o.param : '');

	 	_head.appendChild( _s );
	},
	// 远程数据加载 
	loader : function( o ){
		var _name = o.name || 'jsonp'+this.timestamp();
		window[_name] = function( data ){
			o.callback(data);
		};

		o.request && o.request(_name);
	}
}



//前端网页 操作一些基本功能方法
window._D = function( opt ){
	var opt = opt || {};
	this._DOM = new DOM( opt );
	return this._DOM;
}

function DOM( opt ){
	
	this.opt = {
		target:'',//操作对象
		className:'' ,//设置class
		callback:'' //回调函数
	};
	
	G.extend( this.opt, opt );
};

DOM.prototype = {
	//dom ready
	ready:function(callback){
		var callback = callback || this.opt.callback ,
			_this = this 
		;
		

		if( !this.whenReady ){

			this._funcs =   [] ;
			this._ready =  false;

			var whenReady = (function(){     

		        function handler(e){
		          //如果运行过一次，就返回吧
		          if(_this._ready) return;

		          //如果是readystatechange事件  状态不是complete的话，那文档尚未准备好
		          if( e.type === 'readystatechange' && document.readyState !== "complete" ) return;
		          
		          //运行所有注册函数
		          for (var i = 0; i < _this._funcs.length; i++) {
		              _this._funcs[i].call(document);    
		          };


		          //ready标识为true , 清空所有函数
		          _this._ready = true;
		          _this._funcs = null;
		        }

		        //为接收到的任何事件注册为处理程序
		        if(document.addEventListener){
		          document.addEventListener("DOMContentLoaded",handler,false);
		          document.addEventListener("readystatechange",handler,false);
		          window.addEventListener("load",handler,false);
		        }else if(document.attachEvent){
		          document.attachEvent("onreadystatechange",handler);
		          window.attachEvent("onload",handler);
		        }

		        //console.log(_ready);

		        //返回whenReady()函数
		        return function whenReady(callback){
		          if( _this._ready ){

		            callback.call(document) //准备完毕就运行它
		          }else{
		            _this._funcs.push(callback); //否则，加入对列
		          }
		        }
		    }());

			this.whenReady = whenReady;
		}

		return this.whenReady(callback);
	},

    //dom监听
    domListener:function(o){
    	var o = o || this.opt.o || {},
             elem = o.elem || o.target
            ;
           if(document.all){
                elem.attachEvent('on'+o.event,function(event){
                    var event = event || window.event,
                        target=event.target || event.srcElement
                    ;

                    o.callback.call(this,event,target)
                });
            }else{
                elem.addEventListener(o.event,function(event){
                    var event = event || window.event,
                        target=event.target || event.srcElement
                    ;
                    o.callback.call(this,event,target)
                },false);
            }
    },
	//查找选择器
	query:function( target ){
		var target = target || this.opt.target;

		return document.querySelector( target );
	},
	queryAll:function( target ){
		var target = target || this.opt.target;

		return document.querySelectorAll( target );
	},
	//查找所有目标元素
	loopElem:function( target , callback ){

		if( target !== undefined && target !== null && target.length !== 0 ){
	        if( target.length > 1 ){
	            for( var i =0 ,l = target.length ; i < l ; i++){
	                callback && callback(target[i]);
	            }
	        }else{

	        	if( Object.prototype.toString.call( target ) === "[object Array]" ){
	        		callback && callback(target[0]);
	        	}else{
	        		callback && callback(target);
	        	}
	        }; 
        }
	},
	//替换对象src路径
	replaceSrc:function( target , oldSrc ){
        var _realSrc = '',
        	target = target || this.opt.target 
        ;

        this.loopElem(target,function(_target){
        	replaceImg(_target);
        });

        function replaceImg(obj){
            var _realSrc = obj.getAttribute(oldSrc);
            if( typeof _realSrc !== "undefined" && _realSrc !== undefined && _realSrc !== null ){
                obj.setAttribute('src', _realSrc );
            }

        }
    },
	//检查是否包含class
	checkClass: function(target , className){
        var target = target || this.opt.target ,
        	className = className || this.opt.className ,
        	reg = new RegExp('(?:^|\\s)'+target+'(?!\\S)','g')
        ;
	    	if( reg.test( className ) ){
	        	return true;
	    	}
	    return false;
    },
	// 添加class
	addClass: function(target, className){
		var target = target || this.opt.target ,
        	className = className || this.opt.className ,
			_class = target.getAttribute('class') ,
			_arr = []
		;
		if( !this.checkClass(className,_class) ){

			var newClass = _class;

			if( newClass == null || newClass == ''){
				newClass = className;
			}else{
				newClass = newClass.split(' ');
				for (var i = 0 , l =newClass.length; i < l; i++) {
					if( newClass[i] !== ''){
						_arr.push(newClass[i]);
					}
				};
				newClass = _arr.join(' ');
				if( newClass == '' ){
					newClass = className;
				}else{
					newClass += ' '+className;
				}
				
			}

			target.setAttribute('class',newClass);
		};
	},
	//删除class
	removeClass:function(target, className){
		var	target = target || this.opt.target ,
        	className = className || this.opt.className , 
			_length = target.length 
		;
		   if( _length > 1 ) {
		        for ( var i =0 ; i < _length; i++) {
		          	setClass( target[i], className );
		        };
			}else{
		      setClass( target, className );
			}
		function setClass( elem , className){
		      var _btnClass = elem.getAttribute('class') ,
		          reg = new RegExp(className)
		      ;
		     if( reg.test( _btnClass ) ){
		         _btnClass = _btnClass.replace(className,'');
		         elem.setAttribute('class',_btnClass);
		      }
		}
	},
	//隐藏对象   isAll 是否查找所有的对象
	hide:function(target,isAll){
		var	target = target || this.opt.target ,
			isAll = isAll !== undefined ? isAll : true
		;

		if( isAll ){
			this.loopElem(target,function(_target){
				_target.style.display = 'none';
			});
		}else{
			target.style.display = 'none';
		}
	},
	//显示对象
	show:function(target,isAll){
		var	target = target || this.opt.target ,
			isAll = isAll !== undefined ? isAll : true
		;

		if( isAll ){
			this.loopElem(target,function(_target){
				_target.style.display = 'block';
			});
		}else{
			target.style.display = 'block';
		}
	},
	//转化为url字符串
	urlParamStr:function( o , isAnd ){
		var o = o || this.opt.param , _str = '' ;
		
		for( var key in o ){

			if( isAnd ){
				_str += '&'+key+'='+o[key]+'&';
				isAnd = false;
			}else{
				_str += key+'='+o[key]+'&';
			}
	    }
	    _str = _str.split('') ;
	   	_str.pop();
	    _str = _str.join('');

	    return _str;
	},
	//设置url参数
	setUrlParam:function( url, param ){
		var url = url || this.opt.url,
			param = param || this.opt.param,
			_param = param ,
			_url = '' ,
			_hasParam = url.split('?')[1]
		;

		if( typeof param !== 'string' ){
			_param = this.urlParamStr( param );
		}
		
		if( url.indexOf('?') == -1 ){
			_url = url+'?'+ _param;
		}else{

			if( _hasParam == undefined || _hasParam == null || _hasParam == ''){
				_url = url+_param;
			}else{
				if( typeof param !== 'string' ){
					_param = this.urlParamStr( param , true);
				}
				_url = url+_param;
			}
		}
		return _url;
	},
	//获取当前url对应的参数值 ，如果没有就返回为null
	urlParamValue:function(url,param){
		var url = url || this.opt.url,
			param = param || this.opt.param,
			reg = new RegExp('(\\?|&)' + param + '=([^&?]*)', 'g');
        	arr = url.match(reg) 
        ;
        if( arr !== null ){
        	return arr[0].split('=')[1];
        }
        return null;
	},
	//获取url后面参数，返回obejct,url是search值
	getUrlData:function(search) {
        var spdatas = search.substr(1).split('&'),
            data = {};

        for (var i = spdatas.length - 1; i >= 0; i--) {
            var singleArr = spdatas[i].split('='),
                name = singleArr[0],
                value = singleArr[1] || '';
            data[name] = value;
        }

        return data;
    },
    //touch事件	
    touchFunc:function(obj,type,func){
    	//滑动范围在5x5内则做点击处理，s是开始，e是结束
        var init = {x:5,y:5,sx:0,sy:0,ex:0,ey:0};
        var sTime = 0, eTime = 0;
        type = type.toLowerCase();

        this.domListener({
        	elem:obj,
        	event:'touchstart',
        	callback:function(event,target){
        		sTime = new Date().getTime();
	            init.sx = event.targetTouches[0].pageX;
	            init.sy = event.targetTouches[0].pageY;
	            init.ex = init.sx;
	            init.ey = init.sy;
	            if(type.indexOf("start") != -1) func(event);
        	}
        });

        this.domListener({
        	elem:obj,
        	event:'touchmove',
        	callback:function(event,target){
        		init.ex = event.targetTouches[0].pageX;
	            init.ey = event.targetTouches[0].pageY;
	            if(type.indexOf("move")!=-1) func(event);
        	}
        });
     
      	this.domListener({
        	elem:obj,
        	event:'touchend',
        	callback:function(event,target){
        		var changeX = init.sx - init.ex;
	            var changeY = init.sy - init.ey;
	            if(Math.abs(changeX)>Math.abs(changeY)&&Math.abs(changeY)>init.y) {
	                //左右事件
	                if(changeX > 0) {
	                    if(type.indexOf("left")!=-1) func();
	                }else{
	                    if(type.indexOf("right")!=-1) func();
	                }
	            }
	            else if(Math.abs(changeY)>Math.abs(changeX)&&Math.abs(changeX)>init.x){
	                //上下事件
	                if(changeY > 0) {
	                    if(type.indexOf("top")!=-1) func();
	                }else{
	                    if(type.indexOf("down")!=-1) func();
	                }
	            }
	            else if(Math.abs(changeX)<init.x && Math.abs(changeY)<init.y){
	                eTime = new Date().getTime();
	                //点击事件，此处根据时间差细分下
	                if((eTime - sTime) > 300) {
	                    if(type.indexOf("long")!=-1) func(); //长按
	                }
	                else {
	                    if(type.indexOf("click")!=-1) func(); //当点击处理
	                }
	            }
	            if(type.indexOf("end")!=-1) func();
        	}
        });
    },
	loading:function(){
		var _this = this;
		var _loading = document.getElementById('loading-ball') ;
		//检测是否已注入dom
		function checkDom(isinit){
			var _loading = document.getElementById('loading-ball') ;
			if( _loading == undefined || _loading == null ){
				var _div = document.createElement('div'),
					loadBar = '<div id="loading-ball" '+ (isinit ? 'style="display:block;"': '') +'>\
									<div class="loading-ball-box" >\
										<div class="ball-clip-rotate-multiple">\
											<div></div><div></div>\
										</div>\
										<div class="loading-ball-layer"></div>\
									</div>\
							    </div>';

				_div.innerHTML = loadBar;
				try{
					 document.body.appendChild( _div );
				}catch(err){
					try{
						document.write( _div );
					}catch(e){
						console.log(err);
					}
				}

			}
		};
		//检测是否已注入css
		function checkCss(isinit){
			var _css = document.getElementById('loading-style');
			
			if( _css == undefined || _css == null ){

				var _style = document.createElement('style'),
					_cssText = '#loading-ball{\
									display: none;\
								}\
								.loading-ball-box{\
									z-index:999;\
									height: 60px;\
									width: 60px;\
									position: fixed;\
									top: 50%;\
									left: 50%;\
									border-radius: 7px;\
									-webkit-transform: translateX(-50%) translateY(-50%);\
											transform: translateX(-50%) translateY(-50%);\
								}\
								.loading-ball-layer{\
								    position: absolute;\
								    top: 0;\
								    left: 0;\
								    height: 100%;\
								    width: 100%;\
								    background-color: #333;\
								    opacity: .8;\
								    border-radius: 10px;\
								}\
								.ball-clip-rotate-multiple {\
									position: relative;\
									top: 50%;\
									left: 50%;\
									margin: -20px 0 0 -20px;\
									z-index:999;\
							  	}\
							  	.ball-clip-rotate-multiple > div {\
								    position: absolute;\
								    left: 0;\
								    top: 0;\
								    border: 2px solid #fff;\
								    border-bottom-color: transparent;\
								    border-top-color: transparent;\
								    border-radius: 100%;\
								    height: 35px;\
								    width: 35px;\
								    -webkit-animation-fill-mode: both;\
							        	    animation-fill-mode: both;\
								    -webkit-animation: rotate 1s 0s ease-in-out infinite;\
								            animation: rotate 1s 0s ease-in-out infinite;\
							    }\
							    .ball-clip-rotate-multiple > div:last-child {\
							      display: inline-block;\
							      top: 10px;\
							      left: 10px;\
							      width: 15px;\
							      height: 15px;\
							      -webkit-animation-duration: 0.5s;\
							              animation-duration: 0.5s;\
							      border-color: #fff transparent #fff transparent;\
							      -webkit-animation-direction: reverse;\
							              animation-direction: reverse; \
							      }\
							     @-webkit-keyframes rotate {\
									  0% {\
									    -webkit-transform: rotate(0deg) scale(1);\
									            transform: rotate(0deg) scale(1); }\
									  50% {\
									    -webkit-transform: rotate(180deg) scale(0.6);\
									            transform: rotate(180deg) scale(0.6); }\
									  100% {\
									    -webkit-transform: rotate(360deg) scale(1);\
									            transform: rotate(360deg) scale(1); }\
							     }\
							     @keyframes rotate {\
									  0% {\
									    -webkit-transform: rotate(0deg) scale(1);\
									            transform: rotate(0deg) scale(1); }\
									  50% {\
									    -webkit-transform: rotate(180deg) scale(0.6);\
									            transform: rotate(180deg) scale(0.6); }\
									  100% {\
									    -webkit-transform: rotate(360deg) scale(1);\
									            transform: rotate(360deg) scale(1); } \
							     }\
							     .fadeIn{\
							     	-webkit-animation-name: fadeInKey; /*动画名称*/\
									-webkit-animation-duration: 1.2s; /*动画持续时间*/\
									-webkit-animation-iteration-count: 1; /*动画次数*/\
									-webkit-animation-delay: 0s; /*延迟时间*/\
									opacity: 1;\
									z-index: 999;\
								}\
							     @-webkit-keyframes fadeInKey {\
									0% {\
									opacity: 0; /*初始状态 透明度为0*/\
									}\
									50% {\
									opacity: 0; /*中间状态 透明度为0*/\
									}\
									100% {\
									opacity: 1; /*结尾状态 透明度为1*/\
									}\
								}\
								 @keyframes fadeInKey {\
									0% {\
									opacity: 0; /*初始状态 透明度为0*/\
									}\
									50% {\
									opacity: 0; /*中间状态 透明度为0*/\
									}\
									100% {\
									opacity: 1; /*结尾状态 透明度为1*/\
									}\
								}\
								 .fadeOut{\
							     	-webkit-animation-name: fadeOutKey; /*动画名称*/\
									-webkit-animation-duration: 1.2s; /*动画持续时间*/\
									-webkit-animation-iteration-count: 1; /*动画次数*/\
									-webkit-animation-delay: 0s; /*延迟时间*/\
									opacity: 0;\
								}\
							     @-webkit-keyframes fadeOutKey {\
									0% {\
									opacity: 1; /*初始状态 透明度为0*/\
									}\
									50% {\
									opacity: 0; /*中间状态 透明度为0*/\
									}\
									100% {\
									opacity: 0; /*结尾状态 透明度为1*/\
									}\
								}\
								 @keyframes fadeOutKey {\
									0% {\
									opacity: 1; /*初始状态 透明度为0*/\
									}\
									50% {\
									opacity: 0; /*中间状态 透明度为0*/\
									}\
									100% {\
									opacity: 0; /*结尾状态 透明度为1*/\
									}\
								}';
				_style.type = 'text/css';
				_style.id = 'loading-style';
				_style.innerHTML = _cssText;

				try{
					 document.head.appendChild( _style );
				}catch(err){
					try{
						document.write( _style );
					}catch(e){
						console.log(err);
					}
				}	

			}
		};
		var _load = {
			timer:null,
			init: function(isSet){
				var isSet = (typeof isSet !== 'undefined' && isSet !== '') ? isSet : true;
				
				checkDom(isSet);
				checkCss(isSet);
			},
			show : function(target){
				_load.init();
				var _loading = _this.opt.target || target || document.getElementById('loading-ball') ;
					_this.show(_loading);
					_this.removeClass( _loading , 'fadeOut' );
			},
			hide : function(target){
				_load.init();
				var _loading = _this.opt.target || target || document.getElementById('loading-ball') ;
					_this.hide(_loading);
					_this.removeClass( _loading , 'fadeIn' );
			},
			fadeIn : function(target){
				_load.init();
				var _loading = _this.opt.target || target || document.getElementById('loading-ball') ;
					_this.show(_loading);
					_this.removeClass( _loading , 'fadeOut' );
					_this.addClass( _loading , 'fadeIn' );
			},
			fadeOut : function(target){
				_load.init();
				var _loading = _this.opt.target || target || document.getElementById('loading-ball') ;
					_this.removeClass( _loading , 'fadeIn' );
					_this.addClass( _loading , 'fadeOut' );
					setTimeout(function(){
						_this.hide(_loading);
					},800)
			},
			tips : function(content,target,duration){
				var _duration = duration ||1500;
				_load.init(false);
				var _loading = _this.opt.target || target || document.getElementById('tipsBox') ;
				if(_loading == undefined || _loading == '' || _loading == null){

					var _tips = document.createElement('div'),
						_tip = '<div id="tipsBox" class="tipsBox" '+'style="display: none;height: 100%;width: 100%;position: fixed;top: 0;left: 0;z-index: 999;"' +'>\
										<div class="tips_text" '+'style=" position: absolute;top: 50%;left: 50%;-webkit-transform: translateX(-50%) translateY(-50%);transform: translateX(-50%) translateY(-50%);background-color: #333;opacity: 0.8;color: #fff;text-align: center;padding: 10px;border-radius: 4px;font-size: 14px;"' +'>\
										'+content+'\
										</div>\
									</div>';

					   _tips.innerHTML = _tip;
					try{
						 document.body.appendChild( _tips );
						 callbackfn(content,_loading);
					}catch(err){
						try{
							document.write( _tips );
							callbackfn(content,_loading);
						}catch(e){
							console.log(err);
						}
					}
				}else{

					callbackfn(content,_loading);
				}

				function callbackfn(content,target){
					var _loading = _this.opt.target || target || document.getElementById('tipsBox') ;

					_loading.querySelector('.tips_text').innerHTML = content;
					_load.show(_loading);
					clearTimeout(_load.timer);
					_load.timer = setTimeout(function(){
						_load.fadeOut(_loading);
					},_duration);
				}
			}

		};

		return{
			init : _load.init,
			show : _load.show,
			hide : _load.hide,
			fadeIn : _load.fadeIn,
			fadeOut : _load.fadeOut,
			tips : _load.tips
		}		    

	}
};


window._C = window.D = _D();



/*  popbox  弹窗方法
 *  依赖Jquery/Zepto
 */
;(function(window,$){
	function popUp(opt){
		return new PopUp(opt);
	}
	function PopUp(opt){
		this.body = $("body");
		this.opt = {
			events:'touchstart touchmove touchend',
			content : "",
			classFn : function(){},
			mlisten : function(){},
			popOpen : function(){},
			popClose: function(){}
		};
		$.extend( this.opt , opt );
		this._init();
	};
	PopUp.prototype = {
		_init:function(){
			this._show( this.opt.content );
			this._trigger();
		},
		_trigger:function( _class ){
			var _this = this ,
				_class = _class || []
			;
			this.body.delegate('.popUp-layer',this.opt.events,function(e){
				var _self = $(this) ,
					_e = e ,
					_type = e.type ,
					e = e.srcElement || e.target 
				;
				if( ( $(e).hasClass('popUp-content') || !!$(e).parents('.popUp-content')[0] ) ){
					_this.opt.classFn( $(e) , _this );
					return true;
				}
				return false;
			});

			_this.opt.mlisten();
		},
		_layer:function( content ){
			var layer = $('<div class="popUp popUp-layer" style="overflow:hidden;position:fixed;top:0;left:0;width:100%;height:100%;z-index:997;"><div class="popUp-content"> '+ content +'</div></div>');
			return layer;
		},
		_create:function( content ){
			var _cont = this._layer( content );
			this.body.append( _cont );
			this.opt.popOpen( this.body.find('.popUp') );
		},
		_show:function( content ){
			var 
				_pop = this.body.find('.popUp') ,
				_cont = _pop.find('.popUp-content')
			;
			this.body.addClass('popBody');
			if( !!_pop[0] ){
				_pop.show();
				_cont.html( content );
				this.opt.popOpen(_pop);
				return ;
			}
			this._create( content );
		},
		_close:function(){
			var 
				_pop = this.body.find('.popUp') ,
				_cont = _pop.find('.popUp-content')
			;
			if( !!_pop[0] ){
				this.body.undelegate('.popUp-layer',this.opt.events);
				this.body.removeClass('popBody');
				this.opt.popClose( _pop );
				_pop.hide();
				
			}
		}	
	};

window.popUp = popUp ;

})(window,this.jQuery || this.Zepto);






;(function(window,$){
/*  CORS  跨域共享
 *  可选不使用CORS 用ajax依赖Jquery/Zepto
 */
window.CORS = function( opt ){
    var opt = opt || {};
    this._app = new corsRequest( opt );
    return this._app;
}

var corsRequest = function(opt){
	var _this = this ;
    this.opt = {
    	url:'',//请求地址
    	type:'get',
        load:function(){},
        error:function(){},
        isAjax:false
    };

    G.extend( this.opt, opt );
    //如果使用ajax
    if( this.opt.isAjax ){
    	$.ajax({
            type:this.opt.type,
            url:this.opt.url,
            async:true,
            dataType: 'json',
            success:function(r){
                _this.opt.load.call(this,r);
            },
			error:function(e){
				_this.opt.error.call(this,e);
			}
        });
    }else{
    	this.request();
    }
};
corsRequest.prototype = {
    //创建xmlreq 
    create:function(method,url){
        var xhr = new XMLHttpRequest();  
        if ("withCredentials" in xhr) {  
              
            xhr.open(method, url, true);

        } else if ( typeof (xhr) != "undefined") {  
            //ie
            xhr = new XDomainRequest();  
            xhr.open(method, url, true);  
        } else {  
            // 否则，浏览器不支持CORS  
            xhr = null;  

        }  
        return xhr;  
    },
    //执行xhr请求
    request:function(){

        var _this = this,
            xhr = this.create(this.opt.type, this.opt.url );  

        if (!xhr) {  
            /*alert('CORS not supported');*/  
        } else {  
            xhr.send();  
            //请求失败
            xhr.onerror = function(e){
                //回调失败方法
                if( _this.opt.error !== undefined &&  typeof _this.opt.error == 'function'){
                    _this.opt.error.call(this,e);
                }
            };
            //请求成功
            xhr.onload = function(e){

                if( _this.opt.load !== undefined &&  typeof _this.opt.load == 'function'){
                    var _data = e.target ;
                    if(_data.status == 200 ){
                        //回调成功方法
                        var r = JSON.parse(xhr.responseText);
                        _this.opt.load.call(this,r);

                    }
                    
                }
            }
        }  

    }
};

})(window,this.jQuery || this.Zepto);




/*  验证码
 *  依赖 CORS
 *
 */
;(function(window,$){
	window.captcha = function(opt){
		return new Captcha(opt);
	};

	function Captcha(opt){

		this.opt = {
			isAjax:false,
			target:'', //触发对象
			url:'', //请求地址 参数可跟后面
			data:'',//参数
			mobileName:'mobile',
			mobile:'',//
			timerTarget:'',//时间设置显示对象
			timer:60,//倒计时时间
			isOff:false,//是否打开控制开关
			event:'click', //触发事件
			timeBefore:function(){return true},//倒计时触发之前
			timeAfter:function(){},//倒计时完成之后
			triggerFn:function(fn){},//回调函数
			successFn:function(){},//请求成功
			errorFn:function(){} ,//请求失败
			errorCode:function(){}//代码出错
		};

		G.extend( this.opt , opt );

		this.init();
	};

	Captcha.prototype = {
		//初始化
		init: function(){
			var _timeObj = this.opt.timerTarget || this.opt.target 
			;
			this._html = _timeObj.innerHTML
			this._timeObj = _timeObj;

			this.trigger();

		},
		//触发
		trigger:function(){
			var _this = this ,
				target = this.opt.target;
			;
			if( this.opt.event == 'click' ){
				target.onclick = function(){
					if( !_this.opt.isOff ){
						_this.countDown();
					}
				}
			}else{
				//是否打开入口，请求，倒计时
				triggerFn.call(this,_this.opt.isOff,this.countDown);
			}
		},
		//倒计时
		countDown:function(){
			var _this = this ,
				_time = parseInt( _this.opt.timer );
			;
			
			this.mobile = this.opt.mobile.value;

			//如果为false 不执行后面
			if( !_this.opt.timeBefore() ){
				return;
			} 

			_this.request();

			// 关闭入口
			_this.opt.isOff = true;
			
			var laodTime = function(){

				_this._timeObj.innerHTML = _time;
				
				if( _time <= 0 ){
					//开启入口
					_this._timeObj.innerHTML = _this._html;
					_this.opt.timeAfter();
					_this.opt.isOff = false;
					return;
				}

				setTimeout(function(){
					_time--;
					laodTime();
				},1000)
			};
			laodTime();
		},
		//发送请求
		request:function(){
			var _this = this ,
				_url = this.opt.url 
			;
			if( this.opt.url ){

				if( _url.indexOf('?') !== -1 ){
					if( _url.indexOf('=') ){
						_url += '&'+this.opt.mobileName+'='+_this.mobile+this.opt.data;
					}else{
						_url += this.opt.mobileName+'='+this.mobile+this.opt.data;
					}
				}else{
					_url += '?'+this.opt.mobileName+'='+this.mobile+this.opt.data;
				}

				try{
					CORS({
						isAjax:_this.opt.isAjax,
						url:_url,
						load:function(r){
							_this.opt.successFn(r);
						},
						error:function(e){
							_this.opt.errorFn(e);
						}
					});
				}catch(err){
					_this.opt.errorCode(err);
				}
			}
		}
	};

})(window,this.jQuery || this.Zepto);

