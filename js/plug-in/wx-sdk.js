/*
 *  wxsdk  
 *  2015-9-25
 *  mail:hello@404nan.com
 */

;(function(){

        var _extend = function(target, /*optional*/source, /*optional*/deep) { 
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
        }


        var wxsdk = function(opt){

            return new wxSdk(opt);
        }

        function wxSdk(opt){

            this.opt = {};

            _extend( this.opt , opt );

             this.params = this.opt;

            this.init();
        }

        wxSdk.prototype = {
            //初始化入口
            init : function(){
                if( this.params.type && this.params.type !== '' &&  this.params.type !== undefined ){

                    if( this.params.type == 'async' ){

                        this.async();
                    }else if( this.params.type == 'jsonp' ){
                        this.jsonp();
                    }
                }else{
                    this._config();
                }


            },
            _config : function(){
                var self = this;
                wx.config({
                    debug: this.params.debug || false,
                    appId: this.params.appid,
                    timestamp: this.params.timestamp,
                    nonceStr: this.params.noncestr,
                    signature: this.params.signature,
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'hideMenuItems',
                        'showMenuItems',
                        'hideAllNonBaseMenuItem',
                        'showAllNonBaseMenuItem',
                        'translateVoice',
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'playVoice',
                        'onVoicePlayEnd',
                        'pauseVoice',
                        'stopVoice',
                        'uploadVoice',
                        'downloadVoice',
                        'chooseImage',
                        'previewImage',
                        'uploadImage',
                        'downloadImage',
                        'getNetworkType',
                        'openLocation',
                        'getLocation',
                        'hideOptionMenu',
                        'showOptionMenu',
                        'closeWindow',
                        'scanQRCode',
                        'chooseWXPay',
                        'openProductSpecificView',
                        'addCard',
                        'chooseCard',
                        'openCard'
                      ]
                });
                wx.ready(function(){
                    self.params.callback && self.params.callback.call(self,null);

                    //存在share数据 直接调用share
                    self.params.shareData && self.share(self.params.shareData);
                });
            },

            //异步请求
            async:function(){
                var self = this;
                var xhr = new XMLHttpRequest(),
                    stateChange = function() {
                        if(xhr.readyState == 4) {
                            if (xhr.status == 200 || xhr.status == 0) {
                                var result = xhr.responseText ,
                                    _params = JSON.parse(result)
                                ;
                                _extend( self.params , _params );
                                self._config();
                            }
                        }
                    },
                    type = this.params.method && this.params.method.toLowerCase() == 'post' ? 'POST' : 'GET';
                xhr.onreadystatechange = stateChange;
                xhr.open(type,this.params.url,true);
                xhr.send(null);
            },
            //跨域jsonp
            jsonp:function(){

                var urls = this.params.jsonp.url ? this.params.jsonp.url : window.location.href
                    _url = this.params.jsonp.isEncode ? encodeURIComponent( urls ) : urls  ,
                    self = this
                ;
                    //jsonp
                var fc = {
                    jsonp:function(o){  
                        var _head = o.target || document.getElementsByTagName('head')[0],
                            _s = document.createElement('script'),
                            _urlSever = o.server 
                        ;

                            _s.src = _urlSever +'?url='+o.url+'&callback='+o.callbackFn+ (o.param ? o.param : '');
                            
                        _head.appendChild( _s );
                    },
                    // 远程数据加载 
                    loader : function( o ){
                        var _timer =  new Date().getTime()+parseInt(Math.random()*100) ;
                        var _name = o.name || 'jsonp'+_timer;
                        window[_name] = function( data ){
                            o.callback(data);
                        };

                        o.request && o.request(_name);
                    }
                };


                fc.loader({
                    name:this.params.jsonp.name ? this.params.jsonp.name : '',
                    request:function(name){
                        fc.jsonp({
                            server: self.params.jsonp.server ||'https://m.jdpay.com/open/ticketSignature',
                            url: _url,
                            param:self.params.jsonp.param ? self.params.jsonp.param : '',
                            callbackFn:name
                        });
                    },
                    callback:function(data){
                        var _data = data ;
                        if( data.resultData ){
                            _data = data.resultData;
                        }

                        if( self.params.jsonp.fn ){
                            self.params.jsonp.fn.call(self,data);
                        }

                        self._config();
                    }
                });
            },
            //分享
            share : function(params){
                var u = navigator.userAgent,
                inWx = (u.search(/micromessenger/ig) == -1)? false : true;
               // inApp = ((u.search(/safari/ig) == -1)? true : false);
                if(inWx){
                    wx ? this._shareForNew(params) : this._shareForOld(params); 
                }else{
                    this._shareForApp(params);
                }
            },
            _shareForNew : function(params){
                //如果存在设置分享渠道
                if( params.channel ){
                    var _channel = params.channel.split('|') ,
                        _l = _channel.length
                    ;

                    if( _l > 1 ){
                        for (var i = 0 ; i < _l ; i++) {
                            setMenu( _channel[i] );
                        };
                    }else{

                        setMenu( _channel[0] );
                    }

                }else{
                    wx.onMenuShareAppMessage(params);
                    wx.onMenuShareTimeline(params);
                    wx.onMenuShareQQ(params);
                    wx.onMenuShareWeibo(params);
                }


                function setMenu( target ){
                    switch( target ){
                        case 'wx':
                            wx.onMenuShareAppMessage(params);
                            wx.onMenuShareTimeline(params);
                        break;
                        case 'qq':
                            wx.onMenuShareQQ(params);
                        break;
                        case 'wb':
                            wx.onMenuShareWeibo(params);
                        break;
                    }

                };
            },
            _shareForOld : function(params){
                if(WeixinJSBridge){
                    params.img_url = params.imgUrl;
                    params.appid = this.params.appid;
                    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                                WeixinJSBridge.invoke('sendAppMessage', params, params.success);
                            });
                    WeixinJSBridge.on('menu:share:timeline',function(argv) { 
                                WeixinJSBridge.invoke('shareTimeline', params, params.success);
                            });
                };
            },
            _shareForApp : function(params){
                var u = navigator.userAgent;
                if(u.indexOf("Android") > -1 || u.indexOf("Linux") > -1){
                    if( typeof android !== 'undefined'){
                         android.shareWebPage(params.link, params.title, params.desc);
                    }
                }else if(/*inApp && */ (u.indexOf("iPhone") > -1 || u.indexOf("Mac") > -1)){
                    try{
                        safari.open ="native://shareWebPage?url="+params.link+"&webTitle="+params.title+"&webDesc="+params.desc;
                    }catch(err){
                        window.location.href ="native://shareWebPage?url="+params.link+"&webTitle="+params.title+"&webDesc="+params.desc;
                    }
                }
            }
        };
        if ( typeof define === "function" && define.amd ) {
            define( "wxsdk", [], function() {
                return wxsdk;
            });
        };
        window.wxsdk = wxsdk;
    })();