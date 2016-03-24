/**
 *   抽奖程序
 *   @require Zepto
 *   @author 404nan 
 *   @mail hello@404nan.com
 */

;(function(window,$){
	$.fn.lottery = function( opt ){
		this.each(function(){
			var Lottery = new $.lottery( this , opt );
			Lottery.init();
		});
		return this;
	};

	$.lottery = function ( target , opt ){
		
		this.flag = true;
		this.target = target;

		this.opt = {
			url:null,  //请求地址
			urlData:'', //请求地址参数
			pop :null , //弹窗对象
			successFn:function(){},//请求成功返回后回调
			popfn :function(){}, // 弹窗回调
			checkHasTime:function(){},//检查还有抽奖次数没
			trigger : null, // 触发对象
			unit  : null, // 单元对象组
			index : 1,    // 起点位置
			speed : 20,   // 初始化转动速度
			times : 100000,    // 转动次数 
			baseTimes : 1000,  // 转动基本时间，至少要转多少次才进入抽奖环节
			current : 'current', // 当前选中class
			events : 'click'   //事件类型
		};

		this.hastimes = 0 ;
		this.endtimes = this.opt.times ;
		this.src = 0 ;
		this.text = 0;

		$.extend( this.opt , opt );
	};

	$.lottery.prototype = {
		init: function (){
			var _target = $( this.target ),
				_unit = _target.find( this.opt.unit ),
				_len = _unit.length
			;
			this.unit = _unit ;
			this.len = _len ;

			this.trigger();
		},
		// 触发抽奖，移动过程
		trigger: function (){
			var _self = this,
				_trigger = $(this.opt.trigger)
			;
			_trigger.on( this.opt.events ,function (){

				var _num = $( _self.target ).find( "."+_self.opt.current ).data('number') ,
					_star = _num ? _num : 1 
				;

				if( _self.opt.checkHasTime() ){ // 还有次数 继续抽奖

					if ( _self._len > 0) {
						$( this.target ).find( _self.opt.unit +"-"+ _self.opt.index ).addClass( _self.opt.current );
					}

					if( _self.flag ){
						_self.move(_self.endtimes , _star);
						setTimeout(function(){
							_self.requestData();
						},_self.opt.baseTimes)
					}
				}
			});
		},
		// 检测状态
		status: function ( callback ){
			var _self = this , 
				_error = typeof callback !== 'function' ?  1 : 0 ;
			;
			if( _error ){
				clearTimeout(this.timer);
				_self.flag = true;
			}else if( !_error ){
				clearTimeout(this.timer);
				_self.flag = true;
				callback();
			}

			//popbox
		},
		// 移动
		move: function ( times, index, speed  ){
			var _self = this,
				_index = index || 1 ,
				_speed =  speed || this.opt.speed,
				_times =  times || this.opt.times
			;
		
			if( this.hastimes >= _times ){
				if( !!_self.src ){
					_self.endCallback(); // 回调传入 地址
				}
				this.hastimes = 0;
				this.flag = true;
				return;
			}
			if( this.hastimes >= _times - 10 ){
				_speed += 20
			}else if( this.hastimes >= _times - 6 ){
				_speed += 40
			}else if( this.hastimes >= _times - 2 ){
				_speed += 60
			}

			this.flag = false;
			_self.setDetails(_index);
			this.timer = setTimeout(function(){
				_self.hastimes++;
				_self.move( _self.endtimes, _self.hastimes , _speed );	
			},_speed);
		},
		// 设置转圈次数
		setTimes: function ( _endtimes, _hastimes ){
			this.hastimes = _hastimes;
			this.endtimes = _endtimes;
		},
		// 设置改变细节
		setDetails: function ( i ){
		    i = i%8 ; //取模
		    i = i == 0 ? 8 : i; //将取模为0的数变为8
		    var _current = $( this.target ).find( this.opt.unit +"-"+ i );
			$( this.unit ).removeClass( this.opt.current );
			_current.addClass( this.opt.current );
		},
		// 返回抽奖选中
		onSelectd:function( name, n , src ){
			var _self = this  ,
				_src = '' ,
				_n = n || 8 ,
				_list = $( _self.target ).find( this.opt.unit ) ,
				_i = _self.hastimes%8 ,
				_start = _i == 0 ? 8 : _i ,
				_end  = 0
			;
			_list.each(function( i , v ){
				var _name = $(this).data('name');
				if( _name == name ) {
					_end = $(this).data('number') ;
				    _src = $(this).find('img').attr('src');
				}
			});

			_self.src = src || _src ;

			if( _start < _end ){ 
				_n += _end - _start ;
			}else if( _start > _end ){
				_n +=  9 - _start + _end  ;
			}

			_self.setTimes( _n+_self.hastimes , _start );
			/*_self.status(function(){
			 	_self.move(_n+_self.hastimes, _self.hastimes+2, _self.opt.speed, fn, _src);
			});*/
		},
		endCallback:function(){
			this.showPop( this.opt.pop, true, this.text, this.src );
		},
		showPop:function( target, isImg , text , src ){

			this.opt.popfn( target, isImg , text , src );
		},
		// 读取服务端数据
		requestData: function (){
			var _self = this ,
				_pop = _self.opt.pop ,
				errorText = {
					'title':'啊哦，出错了',
					'text':'你的网络有问题啦，请检查你的网络~',
					'btn':['gotit']
				}
			;
			try{
				$.ajax({
					url:this.opt.url,
					data:this.opt.urlData,
					type:'get',
					dataType: 'json',
					async: false,
					success:function( r ){
						var data = r.data ,
							code = r.code ,
							_addBtn = (data.addBtn !== 'undefined') ? data.addBtn : '',
							_text = {
								'title':data.title,
								'text':data.description,
								'isEntity':false,
								'btn':[]
							}
						;
						_text.btn.push(_addBtn);

						// data.isCash 是否是分享红包
						// data.description 说明
						
						_self.opt.successFn(r);

						switch( code ){
							case 'A00000':
								 if( data.isShare ){
								 	_text.btn.push('share','close');
								 }else if( data.isEntity &&  !data.isShare ){
								 	_text.btn.push('submit');
								 	_text.isEntity = true;
								 }else{
								 	_text.btn.push('continue');
								 }
								 _self.text = _text;
							
								 _self.onSelectd( data.name , 8 ,  data.src );
								
								 break;
							case 'A00001':
								 _text.btn.push('continue');
								 _self.status(true);
								 _self.showPop( _pop, false, _text );
								 break;
						};

					},
					error:function(){
						console.log('error');
						_self.showPop( _pop, false, errorText );
						_self.status(true);
					}
				});

			}catch(err){
				console.log('error2');
				_self.showPop( _pop, false, errorText );
				_self.status(true);
			}
		}
	};

})(window,this.jQuery || this.Zepto);