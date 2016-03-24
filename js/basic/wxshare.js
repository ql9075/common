 (function(){
        var wxshare = {
            init : function(params){
                var self = this;
                if(!this.params && params.async){
                    var xhr = new XMLHttpRequest(),
                        stateChange = function() {
                            if(xhr.readyState == 4) {
                                if (xhr.status == 200 || xhr.status == 0) {
                                    var result = xhr.responseText;
                                    self.params = JSON.parse(result);
                                    self._config(self.params);
                                }
                            }
                        },
                        type = params.type && params.type.toLowerCase() == 'post' ? 'POST' : 'GET';
                    xhr.onreadystatechange = stateChange;
                    xhr.open(type,params.url,true);
                    xhr.send(null);
                }else{
                    this._config(params);
                    this.params = params;
                }
                return this;
            },
            _config : function(params){
                var self = this;
                wx.config({
                    debug: params.debug || false,
                    appId: params.appid,
                    timestamp: params.timestamp,
                    nonceStr: params.noncestr,
                    signature: params.signature,
                    jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'hideMenuItems',
                        'showMenuItems',
                        'hideOptionMenu',
                        'showOptionMenu'
                    ]
                });
                wx.ready(function(){
                    params.callback && params.callback.call(self,null);
                });
            },
            _shareForNew : function(params){
                wx.onMenuShareAppMessage(params);
                wx.onMenuShareTimeline(params);
                wx.onMenuShareQQ(params);
                wx.onMenuShareWeibo(params);
            },
            _shareForOld : function(params){
                if(WeixinJSBridge){
                    params.img_url = params.imgUrl;
                    params.appid = this.params.appid;
                    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                                WeixinJSBridge.invoke('sendAppMessage', params, params.success);
                            });
                    WeixinJSBridge.on('menu:share:timeline',
                            function(argv) { (dataForWeixin.callback)();
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
            },
            share : function(params){
                var u = navigator.userAgent,
                inWx = (u.search(/micromessenger/ig) == -1)? false : true;
               // inApp = ((u.search(/safari/ig) == -1)? true : false);
                if(inWx){
                    wx ? this._shareForNew(params) : this._shareForOld(params); 
                }else{
                    this._shareForApp(params);
                }
            }
        };
        if ( typeof define === "function" && define.amd ) {
            define( "wxshare", [], function() {
                return wxshare;
            });
        };
        window.wxshare = wxshare;
    })();