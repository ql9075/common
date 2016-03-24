
 /**
  *  摇奖机
  *  2016.03.08 by 404nan
  *
  */

     
;(function(window,$){


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



window.LotteryMachine = function( opt ){
        var opt = opt || {};
        return new lotteryMachine( opt );
    };

var lotteryMachine = function(  opt ){

        this.opt = {
            elem:null,
            start:null,
            startFn:null,
            outTime : 0,
            inTime:1000, //至少维持时间
            height:'',//单个高度
            duration: 5,
            groupElem:'section',
            groupLen:3,
            returnCallback:function(){
                return 1;
            },
            beforeCallback:function(){},
            doneCallback:function(){

            }
        };

        _extend( this.opt , opt );

        this.count = 0;
        this.flag = false;
        this.lock = false;
        this.init();
    };

    lotteryMachine.prototype = {

        init:function(){
            var _this = this ,
                _self = document.querySelector( this.opt.elem ),
                _class = _self.getAttribute('class')
            ;            
            this._self = _self;
			 
            this.duration = this.opt.duration || 1 ;
            if (_self.length) {
                _self.setAttrubite('class',_class+' lotteryMachine');
            }
            this._li =  _self.querySelector('li');
            this._lh = this.height || this._li.offsetHeight   ;
            this._liList = _self.querySelectorAll('li'),
            this._len = this._liList.length,
            this._ul = _self.querySelector('ul');
            this._t = parseInt( '-'+this._lh ) ;

            this.tirgger();
            this.setGroup();
        },
        // 触发方法
        tirgger:function(){
           
           var _start = document.querySelector( this.opt.start ) ,
               _this = this
           ;

           if(this.startFn){
             this.startFn.call(this,_this.move());
           }else{
              _start.onclick = function(){
                _this.move();
              }
           }
        },
        //重置
        reset:function(){

            this.flag = false;
            this.duration = this.opt.duration || 1;
            this.index = 0 ;
        },

        //设定 每个分类组
        setGroup:function(){
            var _wrapper =  this._self.querySelector(this.opt.groupElem),
                _list = _wrapper.querySelector('ul').innerHTML
                _html = _list ,
                _elem = document.createElement(this.opt.groupElem) ,
                _lisArr = [document.querySelector(this.opt.elem).querySelector(this.opt.groupElem)]
            ;

            var setLi = function(n,html){
                var _html = html ,
                    _t = ''
                ;

                for(var i=0 ; i < n ; i++){
                    _t = _t +_html;
                }
                return '<div class="lottery-unit"><ul>'+_t+'</ul></div>';
            }

            if(this.opt.groupLen >1){
                for (var i = 0; i < this.opt.groupLen; i++) {
                    var _n = this.opt.duration;
                    if(i==0){
                        _wrapper.innerHTML = setLi(_n,_html);
                    }else{
                        var _elem = document.createElement(this.opt.groupElem);
                        _elem.innerHTML = setLi(_n,_html);
                        _elem.id = 'groups'+i;

                        this._self.appendChild( _elem );
                        _lisArr.push( document.querySelector( '#'+_elem.id ) );
                    }
                }
            }

            this._lisArr = _lisArr;

        },

        //移动
        move:function(){
            var _this = this ,
                _li = this._li,
                _loopLock = false
            ;   

            this._TIMER = (new Date()).getTime();


            // 正在移动  等待完成后再操作
            if( this.lock ){
                return;
            }

               //开始之前回调  返回fasle则不执行后面
            if( this.opt.beforeCallback && !this.opt.beforeCallback() ){
                return;
            }

            // 重置
            this.reset();
            
            // 锁定进行
            _this.lock = true;

            // 设定选中
           _this.opt.returnCallback.call(this,function(_data){
                var _t = (new Date()).getTime() - _this._TIMER ;
                
                if(_data.isError){
                    _this.isStop = true;
                    _this.flag = true;
                    return;
                }

                if( _t <  _this.opt.inTime ){

                    setTimeout(function(){
                         _this.index = _data.index;
                         _this.flag = true;
                    },_this.opt.inTime-_t)
                }else{
                   _this.index = _data.index;
                   _this.flag = true;
                }

                _this.returnData = _data;
            })
           

            // 执行滚动
            for (var i = 0; i < this._lisArr.length ; i++) {
                 //roll(this._lisArr[i]);
                (function(i){                 
                     Roll({
                        target:_this._lisArr[i],
                        duration:_this.duration,
                        index:i, //当前对应序列
                        lenL:_this._len,
                        height:_this._lh,
                        length:_this._lisArr.length,
                        isLockFn:function(){
                              if( i == 0){
                                 _loopLock = true;
                             }
                            return _loopLock;
                        },
                        callback:function(fn){
                           
                            fn && fn({flag:_this.flag,index:_this.index,isStop:_this.isStop});
                        },
                        endCallback:function(index){//结束后返回callback
                            _loopLock = true;
                            if( index == _this._lisArr.length-1){
                                _this.lock = false;
                                 
                                _this.opt.doneCallback && _this.opt.doneCallback(_this.returnData);
                            }
                        }
                     })
                })(i);
             }

        }

    }

var Roll = function(opt){
    var opt = opt || {};
    return new roll( opt );
}

var roll = function(opt){
    var _this = this;
    this.opt = {
        target:'',
        duration:'',
        index:'', //当前对应序列
        lenL:'',//总长度
        height:'',
        length:'',
        callback:function(){//获得数据后标记

        },
        endCallback:function(){//结束后返回callback

        }
    }  

    _extend( this.opt , opt );
    this.flag = false;
    this.duration = this.opt.duration ;
    this.init();
    _this._lock = false;
};

roll.prototype = {
    init:function(){
        var _this = this;

         _this.main();
    },
    loop:function(){
        console.log(this)
        return this.mian();
    },
    main:function(){
        var _target = this.opt.target,
            _this = this,
            _ul = _target.querySelector('ul'),
            _li = _target.querySelector('li') ,
            _list = _target.querySelectorAll('li'),
            _y =  (_list.length-3)*this.opt.height,
            _intimer =(_this.opt.index*0.25)+0.095;
        ;

        this.y = _y;
        
         this.opt.callback.call(this,function(opt){

            if( opt.flag ){
                var _arr =[]

                for (var i = 0; i < _list.length ; i++) {
                    if( _list[i].getAttribute('data-index') == opt.index ){
                        var _x = i-1;
                        _arr.push(_x);
                    }
                };

                setTimeout(function(){
                      var _last = 0 ;
                      if( _arr.length > 0 ){
                          for(var i = 0 ; i < _arr.length ; i++){
                            if(_arr[i] > 0){
                                _last = _arr[i]
                            }
                          }
                      }

                    _ul.style.transition = 'all '+(_this.opt.index+1)*0.5+'s';
                    _ul.style.webkitTransform = "translateZ(0) translateX(0) translateY(-" + parseInt(_last*_this.opt.height) + "px)";
               
                    _this.duration = 0;
                    clearTimeout(_this.time);
                    _this.flag = true;
                    if(_this.opt.index == _this.opt.length-1 ){
                        //动画之行完成后 

                       if(window.WebKitTransitionEvent){

                            _ul.addEventListener("transitionend", function(){
                                
                                _this.opt.endCallback && _this.opt.endCallback(_this.opt.index)
                            }, true)
                       }else{
                            setTimeout(function(){
                                _this.opt.endCallback && _this.opt.endCallback(_this.opt.index)
                            },1500)
                       }

                    }
                },_this.opt.index*400)

            }
            
         });

        if( !_this.flag ){
            var _yy = 0;

            if( _this._lock ){
                _this._lock = false;
                _yy = 0;
            }else{
                _this._lock = true;
                 _yy = _this.y;
            }
            _ul.style.transition = 'all '+_intimer+'s';
            _ul.style.webkitTransform = "translateZ(0) translateX(0) translateY(-" + _yy + "px)";           
             _this.time = setTimeout(function(){
                _this.main();
             },_intimer)
        }

    }
}

})(window,this.jQuery || this.Zepto);
