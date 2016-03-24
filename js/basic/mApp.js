/**
 *  移动端调用APP方法
 *  @404nan
 */
;(function(window){

    /* 
    * @param {Object} target 目标对象。 
    * @param {Object} source 源对象。 
    * @param {boolean} deep 是否复制(继承)对象中的对象。 
    * @returns {Object} 返回继承了source对象属性的新对象。 
    */ 
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
    }; 

    function mApp( opt ){
        var opt = opt || {};
        this._app = new app( opt );
        return this._app;
    }

    function app( opt ){
        
        this.opt = {
            isDebug:false,
            title:'',//设置标题
            text:'',// 分享文字||提示文字||确认提示框
            btn0Name:'', //确认提示框取消按钮名称
            btn1Name:'', //确认提示框确定按钮名称
            key:"",// 添加缓存数据 key
            value:"",// 添加缓存数据 value
            target:null, // 设置url对象
            name:null,   // 业务模块名字
            params:'', // 当前模块的参数 ，例如基金code 
            payParam:'',//支付参数
            callback:null, // 业务模块回调函数  ，callback 为字符串的参数
            eventId:'',   // 埋点 事件id || 一次埋点 
            eventLable:'',// 埋点 事件lable 针对同一事件，描述不同入口
            startY:'',  // 分享图片  起始Y坐标
            endY:'', // 分享图片  终止Y坐标
            jsonChannel:'', // 分享图片  配置渠道
            downloadUrl:'', //下载页面地址
            url:null ,    // 分享地址
            webTitle:null , //分享标题
            webDesc:null    // 分享描述
        };
        
        _extend( this.opt, opt );
    };
    app.prototype = {
        //配置信息
        config:function(o){

            var baseInfo = {} , _this = this , o = this.opt.config || o || {};


            baseInfo.ua = window.navigator.userAgent;

            //京东域，做打开app用
            baseInfo.openLink = this.opt.openLink || o.openLink || 'http://sale.jd.com/app/act/KBuoE641DZmxgYf.html'; 
            
            //安卓下载地址
            baseInfo.androidDownload = this.opt.androidDownload || o.androidDownload ||  'http://sq.jd.com/TjVEZ7';

            //ios下载地址
            baseInfo.iosDownload = this.opt.iosDownload || o.iosDownload ||  'https://itunes.apple.com/us/app/wang-yin-qian-bao/id832444218?ls=1&mt=8';

            //是否是微信
            baseInfo.inWx = (baseInfo.ua.search(/micromessenger/ig) == -1)? false : true;

            //是否是安卓
            baseInfo.inAndroid = baseInfo.ua.match(/(Android)\s+([\d.]+)/);

            //是否是ios
            baseInfo.inIos = baseInfo.ua.match(/(iPhone\sOS)\s([\d_]+)/);

            //ios钱包
            baseInfo.inIosJdWallet = (baseInfo.ua.search(/safari/ig) == -1 && baseInfo.ua.search(/micromessenger/ig) == -1 && baseInfo.ua.indexOf('jdapp') == -1 && baseInfo.ua.indexOf('UC') == -1 && baseInfo.ua.indexOf('MQQBrowser')) == -1 ? true : false;

            //检查后缀
            baseInfo.check_domain = function(host){
                var pattern = "/^aero$|^cat$|^coop$|^int$|^museum$|^pro$|^travel$|^xxx$|^com$|^net$|^gov$|^org$|^mil$|^edu$|^biz$|^info$|^name$|^ac$|^mil$|^co$|^ed$|^gv$|^nt$|^bj$|^hz$|^sh$|^tj$|^cq$|^he$|^nm$|^ln$|^jl$|^hl$|^js$|^zj$|^ah$|^hb$|^hn$|^gd$|^gx$|^hi$|^sc$|^gz$|^yn$|^xz$|^sn$|^gs$|^qh$|^nx$|^xj$|^tw$|^hk$|^mo$|^fj$|^ha$|^jx$|^sd$|^sx$/i";
                    if(str.match(pattern)){
                        return 1;
                    }
                    return 0;
            };

             //返回域
            baseInfo.get_domain = function () {
                var host = document.domain.replace(/^www\./, ""), arr = host.split('.'), len = arr.length, domain;
                if(len == 3){
                    domain = arr[1] +'.'+ arr[2];
                }else if(len > 3){
                    var ip_pat = "^[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*$";
                    if(host.match(ip_pat)){
                        return host;
                    }
                    if(baseInfo.check_domain(arr[len-2])) {
                        domain = arr[len-3]+"."+arr[len-2]+"."+arr[len-1];
                    }else{
                        domain = arr[len-2]+"."+arr[len-1];
                    }
                }
                return domain;
            }


            //是否在jd钱包里
            baseInfo.inJdWallet = o.inJdWallet ? o.inJdWallet : function(o){
                var o = o||{},
                    check = o.check || ''
                ;
                
                if( check == '' ){
                    check = true;
                }

                if( check ){

                    if( baseInfo.inAndroid ){
                        return typeof(android) != 'undefined' ? true : false;
                    }else if( baseInfo.inIos ){
                        return baseInfo.inIosJdWallet;
                    }else{
                        return false;
                    }
                }
            };

            //底部bar
            baseInfo.bottomBar = function(o){

                var o = o || _this.opt.config ||{},
                    btn = o.btn || '立即打开',
                    title = '',
                    desc = o.desc||'理财专家 生活助手',
                    img = o.img || 'http://img13.360buyimg.com/cms/jfs/t790/61/1403238732/5911/2dcd4cf2/559f6b56Na06dce77.png',
                    _html = '',
                    touchFunc = o.touchFunc || false,
                    _dom = document.createElement('div'),
                    _body = document.getElementsByTagName('body')[0]
                ;
                _dom.className = 'fix-bottom J_openBtn';
                _dom.id = 'J_openBtn';
                
     

                if( o.style == 'style2' ){
                    btn = o.btn || '打开京东钱包';
                    title = o.title || '京东钱包诚意之作' ;
                    _dom.style.cssText = 'position: fixed; box-sizing: border-box; left: 0; bottom: 0;  width: 100%; padding: 15px 10px; overflow: hidden; line-height: 1; background-color: rgba(0,0,0,0.6); z-index: 999;display: block;text-align:center;background: -moz-linear-gradient(top, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.75) ,rgba(0, 0, 0, 0.93));background: -webkit-linear-gradient(top, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.75) ,rgba(0, 0, 0, 0.93));';
                    _html = '<div class="fb-logo" style="color: #fff; font-size: 14px;">\
                                <p style="font-size: 14px; margin:0 0 8px 0;padding:0;opacity: .9;color: #fff;">'+title+'</p>\
                             </div>\
                             <div class="fb-download J_confirm" id="J_confirm" style="border-radius: 4px;display: inline-block;padding: 0 50px;text-align: center;line-height: 40px;font-size: 16px;color: #fff;background: #d7454e;height: 40px;">\
                                '+btn+'\
                             </div>'
                             ;
                }else{
                    btn = o.btn || '立即打开';
                    title = o.title || '京东钱包客户端' ;
                    _dom.style.cssText = 'position: fixed; box-sizing: border-box; left: 0; bottom: 0;  width: 100%; padding: 15px 10px; overflow: hidden; line-height: 1; background-color: rgba(0,0,0,0.6); z-index: 999;display: block;';
                    _html = '<div class="fb-download J_confirm" id="J_confirm" style="float: right; border-radius: 4px;  width: 80px; padding: 0 15px; text-align: center; line-height: 40px; font-size: 16px; color: #fff; background: #d7454e;height: 40px;">\
                                '+btn+'\
                             </div>\
                             <div class="fb-logo" style="color: #fff; font-size: 14px;">\
                                <div class="fb-logo-img" style="width:40px;height:40px;background:url('+img+') no-repeat;background-size:100% 100%;float: left; width: 40px; margin-right: 10px; vertical-align: bottom;"></div>\
                                <p style="font-size: 18px; margin:0 0 8px 0;padding:0;  color: #fff;">'+title+'</p>\
                                <span style="color: #fff;">'+desc+'</span>\
                             </div>';
                }

                _dom.innerHTML = _html;

                if( o.callback ){
                    o.callback(function(e,target){
                         if( target.className.indexOf('J_confirm')>-1){
                            _this.start();
                        }
                    })
                }else if( o.touchFunc ){
                    _this.touchFunc(_body,o.type || 'click',function(e,target){
                        if( target.className.indexOf('J_confirm')>-1){
                           /* _this.start({isInApp:function(){
                                return baseInfo.inJdWallet;
                            }});*/
                            _this.start();
                        }
                    });
                }else{
                    _this.domListener({
                        elem:_body,
                        event:o.type || 'touchend',
                        callback:function(e,target){
                            
                            if( target.className.indexOf('J_confirm')>-1){
                               
                                _this.start();
                            }
                        }   
                    });
                }


                if( !document.querySelector('.J_confirm') ){
                    _body.appendChild(_dom);
                }else{
                    document.querySelector('.J_confirm').style.display = 'block';
                }
            };

            //下载提示框
            baseInfo.popDownload = function(o){
                var  //baseInfo.inIos ? baseInfo.iosDownload : baseInfo.androidDownload;
                    o = o || _this.opt.config || {} ,
                    downLoadUrl = o.url || baseInfo.openLink ,
                    tips = o.tips || '下载安装京东钱包客户端',
                    btn = o.btn || '立即下载',
                    timer = o.timer || 6000
                ; 
             
                if(!document.querySelector('.J_layerDom')){
                    var lDom = document.createElement('div');
                    lDom.className = 'J_layerDom';
                    lDom.style.cssText = 'position: fixed; z-index: 3000; left: 50%; top: 50%; margin: -85px 0 0 -140px; width: 280px; padding: 20px 0; text-align: center; background: rgba(0,0,0, .8); border-radius: 6px; color: #fff';
                    lDom.innerHTML = '<p style="margin-bottom: 30px; font-size: 18px;">'+tips+'</p><a href="'+downLoadUrl+'" class="J_appDownload" style="display: block; width: 90%; margin-left: 5%; font-size: 16px; line-height: 40px; border-radius: 3px; text-decoration:none;font-weight: bold; background: #d9434b; color: #fff; ">'+btn+'</a>';
                    document.body.appendChild(lDom);
                }else{
                    document.querySelector('.J_layerDom').style.display = 'block';
                }
                setTimeout(function(){
                    document.querySelector('.J_layerDom').style.display = 'none';
                }, timer);
            };

            return baseInfo;
        },

        // 默认缓存config
        configData:function( o ){
            var o =  o || this.opt.config || {} ,
                _config = this.config( o )
            ;
            
            return _config;
        },

        //钱包ready 回调
        jdWalletReady:function(callback){
            var me = this,
                UA = window.navigator.userAgent,
                isIosUA = /iPad|iPhone|iPod/.test(UA),
                isWalletClientUA = /WalletClient/.test(UA),
                clientInfo =  {
                    isInApp:false
                }
                ;

            if ( !callback || typeof callback !== 'function' ) throw '必要参数`callback`错误';

            //判断是否是在 京东钱包 Android 客户端内
            if (typeof window.android === 'object' && isWalletClientUA) {
                clientInfo.name = 'android';
                clientInfo.isInApp = true;
                callback.call(this, clientInfo );

            //判断是否是在 iOS 浏览器
            } else if (isIosUA) {
              
                //在APP里面
                if ( isWalletClientUA ) {
                  
                    clientInfo.name = 'ios';
                    clientInfo.isInApp = true;
                    callback.call(this, clientInfo );
                } else {
                    //IOS APP 第一次取不到UA信息，尝试每100ms获取一次，总共10次
                    tryToGetClientInfo(10, 100);
                }
            } else {
                callback.call(this,clientInfo);
            }

            function tryToGetClientInfo(times, interval){
              var i = 0;
              (function checkStatus() {

                  timmer = setTimeout(function() {

                      if ( isWalletClientUA ) {
                          clientInfo.name = 'ios';
                          clientInfo.isInApp = true;
                      }
                      if ( !clientInfo.isInApp && i < times ) {
                          checkStatus();
                      } else {
                          clearInterval(timmer);
                          callback.call(me , clientInfo);
                      }
                      i++;
                  }, interval);
              }());
            }

             document.addEventListener('WebViewJavascriptBridgeReady', function() {
                clientInfo.name = 'ios';
            }, false);
        },
        // 执行方法
        _execute: function( method ){
            var _this = this;

            if( _this.configData().inJdWallet() ){
                if ( _this.configData().inAndroid ) {
                    method.android();
                }else if( _this.configData().inIos ){
                    method.ios();
                }
                _this.opt.isDebug && console.log('in jdwallet!');
            }else{
                 method.other && method.other();
                _this.opt.isDebug && console.log('no in jdwallet!');
            }
        },
        _reqNative: function(url){
            var iframe = document.createElement("iframe");
            iframe.src= url;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            setTimeout(function(){
                iframe.parentNode.removeChild(iframe);
            }, 2000);
        },

        // 关闭浏览器
        close: function(){
            var _this = this;
            var method = {
                android:function(){
                    android.close();
                },
                ios:function(){
                    window.location.href = "native://close";
                }
            };
            
            this._execute( method );
        },

        // 启动业务模块
        start:function(_json){
            var _this = this;
            window.noop  = function(){};
            var _json = _json || {};
            _json = {
                name:_json.name || _this.opt.name || arguments[0] || 'HOME',
                params:_json.params || _this.opt.params || arguments[1],
                callback:_json.callback || _this.opt.callback || 'noop',
                isInApp :  _json.isInApp ? _json.isInApp() : _this.configData().inJdWallet()
            };
            
            //执行方法
             openModel(_json);

             function openModel(json){
                if(_this.configData().inAndroid && _json.isInApp ){
                    openAndroid(json);
                }else if(_this.configData().inIos &&  _json.isInApp && _this.configData().inIosJdWallet && !_this.configData().inWx){
                    openIos(json);
                }else if(_this.configData().inWx){
                    if(_this.configData().get_domain() == 'jd.com'){
                        openIframe(json);
                    }else{
                        openLink(json);
                    }
                }else{
                    openIframe(json);
                }
                
                function json2str(json){
                    var str = '';
                    for(var i in json){
                        str += '&'+i+'='+json[i]
                    };
                    return str;
                };


                //获取模块
                function getModule(){
                    var _name = json.name || 'HOME',
                        _params = json.params || '',
                        _paramsType = Object.prototype.toString.call( _params ),
                        data = {
                            name : _name ,
                            params : _params,
                            link:'',
                            url:''
                        };
                    ;

                    var return_url = 'http://m.jdpay.com/user/vJdLoginH5?url=';

                    data.name = _name;

                    switch(_name){
                        case 'ACTIVITY':
                               if( _paramsType == "[object Object]"  ){  
                                    data.params = json2str(_params);
                                    if( _params.browserUrl ){
                                        data.link = '?url='+_params.browserUrl;
                                    }
                                }else if( _paramsType == "[object String]" ){
                                    data.params = '&browserUrl='+_params;
                                    data.link = '?url='+_params;
                                }
                            break
                        case 'RETURN':
                                data.name = 'ACTIVITY';
                               if( _paramsType == "[object Object]"  ){  
                                    data.params = json2str(_params);
                                    if( _params.browserUrl ){

                                        data.link = '?url='+return_url+encodeURIComponent(_params.browserUrl);
                                    }
                                }else if( _paramsType == "[object String]" ){
                                    data.params = '&browserUrl='+return_url+encodeURIComponent(_params);
                                    data.link = '?url='+encodeURIComponent(_params);
                                }
                            break
                        case 'FUND':
                                if( _paramsType == "[object Object]"  ){  
                                    data.params = json2str(_params);
                                     if( _params.code && _this.configData().inAndroid ){
                                        data.link = '?code='+_params.code;
                                    }
                                }else if( _paramsType == "[object String]" ){
                                    data.params = '&code='+_params;
                                    if( _this.configData().inAndroid ){
                                        data.link = '?code='+_params;
                                    }
                                }
                            break
                    }           
                    data.url = data.name+data.params;
                    data.link += '#'+data.name;
                    return data;
                }

                //构造iframe激活app
                function openIframe(json){
                    var str = json2str(json.params);
                    var ifrSrc = 'wangyin://wallet/start?module='+getModule().url;
                    if (!ifrSrc) return;
                    _this._reqNative(ifrSrc);
                    setTimeout(function(){
                        var _opt = _this.opt.config || {} ;
                        _opt.url = _opt.url || _this.config().openLink+getModule().link;
                        _this.configData().popDownload(_opt);
                    },300);
                };

                //通过打开京东域的链接
                function openLink(json){
                    var url = _this.config().openLink;
                    /* if(json.name == 'ACTIVITY'){
                        url += '?url='+json.params;
                    };*/
                    window.location.href = url+getModule().link;
                };

                //android客户端打开
                function openAndroid(json){
                    try{
                        if(json.name == 'ACTIVITY'){
                            android.start(json.params, json.callback);
                        }else{
                            android.start(json.name,JSON.stringify(json.params), json.callback);
                        }
                    }catch(err){
                        var _text = json.alert || '请升级最新版京东钱包' ;
                        _this.alert(_text);
                    }
                };

                //ios客户端打开
                function openIos(json){
                    var str = json.params ? json2str(json.params) : '',
                        url = 'native://start?name='+json.name+str+'&callback='+json.callback;
                    if(json.name == 'ACTIVITY'){
                        url = 'native://start?name='+json.params;
                    };

                    _this._reqNative(url);
                };

             };

        },
        //dom监听
        domListener:function(o){
            var o = o || {},
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
                    if(type.indexOf("start") != -1) func(event,target);
                }
            });

            this.domListener({
                elem:obj,
                event:'touchmove',
                callback:function(event,target){
                    init.ex = event.targetTouches[0].pageX;
                    init.ey = event.targetTouches[0].pageY;
                    if(type.indexOf("move")!=-1) func(event,target);
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
                            if(type.indexOf("left")!=-1) func(event,target);
                        }else{
                            if(type.indexOf("right")!=-1) func(event,target);
                        }
                    }
                    else if(Math.abs(changeY)>Math.abs(changeX)&&Math.abs(changeX)>init.x){
                        //上下事件
                        if(changeY > 0) {
                            if(type.indexOf("top")!=-1) func(event,target);
                        }else{
                            if(type.indexOf("down")!=-1) func(event,target);
                        }
                    }
                    else if(Math.abs(changeX)<init.x && Math.abs(changeY)<init.y){
                        eTime = new Date().getTime();
                        //点击事件，此处根据时间差细分下
                        if((eTime - sTime) > 300) {
                            if(type.indexOf("long")!=-1) func(event,target); //长按
                        }
                        else {
                            if(type.indexOf("click")!=-1) func(event,target); //当点击处理
                        }
                    }
                    if(type.indexOf("end")!=-1) func(event,target);
                }
            });
        },
        //全局回调
        fnCallback:function( name , callback ){
            window[name] = function( result ){
                callback && callback(result);
                delete window[name];
            };      
        },

        // 获取客户端信息
        getInfo:function(_fn){
            var _this = this,
                _name = ('globalCallback' + Math.random()).replace(/\./, ''),
                callback = _fn|| _this.opt.callback || '',
                method = {
                    android:function(){
                        android.getInfo(_name);
                    },
                    ios:function(){
                        _this._reqNative("native://getInfo?callback="+_name);
                    }  
                };

            this.fnCallback(_name, callback );


            // callback  全局函数
            // return josn;
            //json = {
            //  "isLogin": "",
            //  "isRealName":"",
            //  "wyPin": "",
            //  "jdPin": "",
            //  "version": "",
            //  "clientName":"android",
            //  "loginName":""
            //}
            _this._execute( method );
        },

        // 设置标题
        setTitle:function(title){
            var _this = this ,
                _title = title||_this.opt.title
            ;
            var method = {
                android:function(){
                    android.setTitleName(_title);
                },
                ios:function(){
                    _this._reqNative('native://setTitleName?titleName=' +_title );
                }
            };

            this._execute( method );
        },

        // 设置回退监听  callback返回1客户端不执行操作，返回0执行回退
        setBack:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.setGoBackListener(_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://setGoBackListener?listener=' + _this.opt.callback );
                }
            };

            this._execute( method );
        },

        // 分享网页
        share:function(o){
            var _this = this,
                o = {
                    url:o.url||_this.opt.url||'',
                    title:o.title||_this.opt.title||'',
                    desc:o.desc||_this.opt.desc||'',
                    channel:o.channel||_this.opt.channel||'',
                    callback:o.callback||_this.opt.callback||''
                }
            ;
            var method = {
                android:function(){
                    android.shareWebPage( o.url, o.title, o.desc,o.channel,o.callback);
                },
                ios:function(){
                    _this._reqNative('native://shareWebPage?url=' + o.url + '&webTitle=' + o.title + '&webDesc=' + o.desc + '&jsonChannel=' + o.channel+'&callback='+o.callback);
                }
            };

            this._execute( method );
        },

        //分享图片
        shareImage:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.shareImage(_this.opt.startY,_this.opt.endY,_this.opt.jsonChannel,_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://shareImage?startY='+_this.opt.startY+'&endY='+_this.opt.endY+'&callback='+_this.opt.callback+'&jsonChannel='+_this.opt.jsonChannel+'&callback='+_this.opt.callback);
                }
            };
            this._execute( method );
        },

        // 分享文字
        shareText:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.shareText(_this.opt.text,_this.opt.jsonChannel,_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://shareText?text='+_this.opt.text+'&jsonChannel='+_this.opt.jsonChannel+'&callback='+_this.opt.callback);
                }
            };
            this._execute( method );
        },

        //支付  var payParam = JSON.stringify(ParamEntity);  2015-5-6 将参数实体转换成 json 字符串，传递给客户端
        pay:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.pay(_this.opt.payParam,_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://commonPay?params='+_this.opt.payParam+'&callback=' + _this.opt.callback );
                }
            };

            this._execute( method );
        },

        //埋点
        buriedPoint:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.buriedPoint(_this.opt.eventId,_this.opt.eventLable);
                },
                ios:function(){
                    _this._reqNative('native://buriedPoint?eventId='+_this.opt.eventId+'&eventLable=' + _this.opt.eventLable );
                }
            };
            this._execute( method );
        },

        //一次埋点
        buriedPointOnce:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.buriedPointOnce(_this.opt.eventId);
                },
                ios:function(){
                    _this._reqNative('native://buriedPointOnce?eventId='+_this.opt.eventId );
                }
            };
            this._execute( method );
        },

        // 提示
        alert:function(content){
            var _this = this ,
                _text = content || _this.opt.text
            ;
            var method = {
                android:function(){
                    android.alert(_text);
                },
                ios:function(){
                    _this._reqNative('native://alert?text='+_text+'&callback='+_this.opt.callback );
                },
                other:function(){
                    alert(_text);
                }
            };
            this._execute( method );
        },

        // 确认提示框
        confirm:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.confirm(_this.opt.text,_this.opt.callback,_this.opt.btn0Name,_this.opt.btn1Name);
                },
                ios:function(){
                    _this._reqNative('native://confirm?text='+_this.opt.text+'&callback='+_this.opt.callback+'&btn0Name='+_this.opt.btn0Name+'&btn1Name='+_this.opt.btn1Name );
                }
            };
            this._execute( method );
        },

        //  校验网络
        checkNetwork:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.checkNetwork(_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://checkNetwork?callback='+_this.opt.callback );
                }
            };
            this._execute( method );
        },

        //  添加缓存数据
        putCache:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.putCache(_this.opt.key,_this.opt.value);
                },
                ios:function(){
                    _this._reqNative('native://putCache?key='+_this.opt.key+'&value='+_this.opt.value);
                }
            };
            this._execute( method );
        },

        // 获取缓存数据
        getCache:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.getCache(_this.opt.key,_this.opt.callback);
                },
                ios:function(){
                    _this._reqNative('native://getCache?key='+_this.opt.key+'&callback='+_this.opt.callback);
                }
            };
            this._execute( method );
        },

        // 移除缓存数据
        removeCache:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.removeCache(_this.opt.key);
                },
                ios:function(){
                    _this._reqNative('native://removeCache?key='+_this.opt.key);
                }
            };
            this._execute( method );
        },

        // 清空缓存数据
        removeAllCache:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.removeAllCache();
                },
                ios:function(){
                    _this._reqNative('native://removeAllCache');
                }
            };
            this._execute( method );
        },

        // 清空缓存数据
        removeAllCache:function(){
            var _this = this;
            var method = {
                android:function(){
                    android.removeAllCache();
                },
                ios:function(){
                    _this._reqNative('native://removeAllCache');
                }
            };
            this._execute( method );
        },
        //设置title 隐藏
        setTitleVisible:function(_num){
            var _this = this,
                num = _num || _this.opt.num || ''
                method = {
                android:function(){
                    android.setTitleVisible(num);
                },
                ios:function(){
                    _this._reqNative('native://setTitleVisible?visible='+num);
                }
            };
            this._execute( method );
        },
        //设置菜单
        setMenu:function(menuList){
            var json = {},
                method = {},
                str = '['
            ;
            
            menuList.forEach(function(obj, index){
                json['item'+index] = obj;
                str += JSON.stringify(obj)+',';
            })
            str = str.substring(0, str.length-1);
            str += ']';


            method = {
                android:function(){
                    android.setTitleMenu(str);
                },
                ios:function(){
                     WebViewJavascriptBridge.callHandler('setMenu', json)
                }   
            };

            this._execute( method );
        },
        //微信配置数据
        dataForWeixin:function(json,fn){
            var  _callback = function(){} ,
                json = json || {},
                _this = this 
            ;
            window.dataForWeixin = {    
                appId: json.appId || '',
                MsgImg: json.MsgImg || 'http://img13.360buyimg.com/cms/jfs/t790/61/1403238732/5911/2dcd4cf2/559f6b56Na06dce77.png',
                imgUrl: json.imgUrl || 'http://img13.360buyimg.com/cms/jfs/t790/61/1403238732/5911/2dcd4cf2/559f6b56Na06dce77.png',
                url: json.url || '',
                title: json.title || '',
                desc: json.desc || '',
                fakeid: json.fakeid || "",
                defaultShare: json.defaultShare || false,
                callback: json.callback || _callback 
            };

            //默认关闭分享
            if( !dataForWeixin.defaultShare ){
                return;
            }
            
            var onBridgeReady = function(){
                if(!dataForWeixin){
                    return;
                }

                params = dataForWeixin;

                var u = _this.configData().baseInfo.ua ;
                inWx = (u.search(/micromessenger/ig) == -1)? false : true;
               
                if(inWx){
                    wx ? this._shareForNew(params) : this._shareForOld(params); 
                }else{
                    this._shareForApp(params);
                }
            };

            var shareForNew = function(params){
                 wx.onMenuShareAppMessage(params);
                 wx.onMenuShareTimeline(params);
                 wx.onMenuShareQQ(params);            }

            var shareForOld = function(params){
                if(WeixinJSBridge){
                    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                                WeixinJSBridge.invoke('sendAppMessage', params, params.success);
                            });
                    WeixinJSBridge.on('menu:share:timeline',
                            function(argv) { 
                                WeixinJSBridge.invoke('shareTimeline', params, params.success);
                            });
                };
            }

            onBridgeReady = fn || onBridgeReady;

            if (document.addEventListener) {
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            } else if (document.attachEvent) {
                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            }
        }

    };

   window.mApp = mApp ;
   window._mApp = mApp() ;

})(window);


function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge)
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
            callback(WebViewJavascriptBridge)
        }, false)
    }
}