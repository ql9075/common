/*
 *  404Nan  by  2015-2-9
 *  下拉联动选择插件
 */
;(function($,window){

    $.fn.selectAddress = function( opt ){

        this.each(function(){
            var selectaddress = new $.selectAddress( this , opt );
                selectaddress.init();
        });

        return this;
    };

    $.selectAddress = function( obj , opt ){

        this.target = obj ;

        this.option = {

            isSetFirst : false ,
            firstData : {
              //  "value":"text"
            },
            url:'../',
            storeData:function( target ){
                /*
                显示已有的地址
                if( data ){
                    return{
                        "province":"四川省",
                        "city":"成都市",
                        "subbranch":"成都银行高新支行"
                    }
                }
                return false;

                */
            },
            setRequestCallback:function( _select ){

                /*
                传到后台的参数
                return {
                    addressValue : _addressValue , 选中value
                    addressName  : _addressName ,  当前select name
                    bank         : _bank
                }
                */
            },
            timeout:function( target ){
            /*返回网络超时*/
            },
            empty:function( target ){
            /*返回为空*/
            },
            success:function( target){
            /*返回成功*/
            }
        };

        $.extend( this.option , opt );

    }

    $.selectAddress.prototype = {

        init:function(){

            var _this = this ,
                _self = $( this.target )
            ;

            _this.selects = _self.find('select') ;
            _this.selectLength = _self.find('select').length  ;
            _this._firstSelect = _self.find('select:first') ;


            if( !_this.loadFirstData() ){
                throw new Error("数据不足!");
                return false;
            }

            // 解决ie8 默认不执行的bug，利用事件唤醒
            $(window).scrollTop(0,0);

            //初始化触发事件
            _this.trigger();
        },
        trigger:function(){

            //初始化遍历每个选择值
            this.initEach();

            //初始化事件
            this.change();

            //初始化已存在的地址
            this.StoreDataInit();

        },
        /**
         *  初始加载第一个select数据
         */
        loadFirstData:function(){

            var _this = this ;
            //如果要设置第一个select数据,就读取设置的数据
            if( _this.option.isSetFirst && !$.isEmptyObject( _this.option.firstData ) ){

                var _default = {
                        value:_this._firstSelect.find('option:first').val() ,
                        text:_this._firstSelect.find('option:first').text()
                    };

                _this.htmlRender( _this._firstSelect , _default , _this.option.firstData  );

                return true ;
            }else if( !_this.option.isSetFirst && _this._firstSelect.find('option').length > 2 ){

                return true ;
            }else if( !_this.option.isSetFirst && _this._firstSelect.find('option').length <= 1 ){
                _this.getData();
                return true;
            }

            return false ;
        },
        StoreDataInit:function(){

            var _address = this.option.storeData( $( this.target ) ) ;

            if( !!_address ){// 如果存在已填地址，就显示出来

                this.selectdFn( _address , $(this.selects[0]) ) //初始化第一个

               // this.setstoreData( _address );
            }
        },
        setstoreData:function( storelist , arr  ){

             var _arrs =  arr || [].slice.call( this.selects ) ,
                _currSelect = _arrs[0]
            ;
            this.getData( _currSelect , _arrs , storelist );
        },
        /**
         * 设置选中值
         */
        selectdFn:function( storelist , _select ,_arrs ){

            var _this = this ,
                _currSelect = _select ,
                _currName = $( _currSelect ).attr( 'name' ) ,
                _option = $( _currSelect ).find('option') ,
                _arr = _arrs ? _arrs :'';
            ;

            for( var key in storelist ){
                if( key == _currName ){
                    _option.each(function( i , value ){

                        var _self = $(this);

                        if( $.trim( storelist[key] ) ==  $.trim( _self.text() ) ){

                            _self.attr('selected',true);
                            console.log(_self)
                            _this.setstoreData( storelist , _arr )
                            return;
                        }
                    });
                    break;
                }
            }
        },
        initEach:function(){
            var _this = this ;
            this.selects.each(function(i,v){
                var _self = $(this) ;
                    _self[0]._index = i;
                 if( _self.find('option:selected').val() == ('' && '0') ){
                    _this.sDisabled( _self )
                }
            });
        },
        change:function(){
            var _this = this ;

            this.selects.change(function(){
                var _self = $(this) ;

                _this.sDisabled( _self );

                if( _self.find('option:selected').val() !== ('' && '0')  &&  ( _self[0]._index !== (_this.selectLength - 1) ) ){

                    _this.getData( _self );

                }
            });
        },
        getData:function( target , arr , storelist ){

            var _this = this ,
                //如果存在目标对象就给后面兄弟元素渲染数据，反之给第一个渲染
                _target = target ? $($( target ).nextAll('select')[0])  : _this._firstSelect ,
                _flag = target ? true : false ,
                _default = {
                    value: _target.find('option:first').val(),
                    text : _target.find('option:first').text()
                } ,
                _arrs =  arr || [].slice.call( this.selects )
            ;

            console.log(target,_target)
            if( _arrs && _arrs.length <= 0 ){
                return;
            }

            $.ajax({
                url: _this.option.url ,
                async:true,
                type:'get',
                data:_this.option.setRequestCallback.call( this, target ),
                dataType: 'json',
                success:function( r ){
                    _this.ajaxSuccess( r , _target , _default , _flag , arr , storelist);
                },
                error:function(){
                    //_target.html( _html );
                }
            });
        },
        ajaxSuccess:function( r , target , _default , _flag , _arrs , storelist){

            var _data  = r.data , _code = r.code , _this = this ;

            if( $.isEmptyObject( _data ) ){// 如果是个空对象 就禁用后面select下拉
                _this.sDisabled( target  );
            }

            switch( _code ){
                //网络超时
                case 'A00005':
                   _this.timeout.call(this, $( this.target ));
                break;
                //返回为空
                case 'A00004':
                   _this.empty.call(this, $( this.target ));
                break;
                //成功
                case 'A00000':

                    _this.htmlRender( target , _default , _data );

                    _this.option.success && _this.option.success.call(this, $( this.target ) )

                    if( _arrs && _arrs.length > 0 ){
                        _arrs.shift();
                       // _this.setstoreData( storelist , _arrs , target );
                    }

                    if( storelist  ){
                        _this.selectdFn( storelist , target ,_arrs);
                    }else if( !_flag && !!_this.option.storeData( $( this.target ) ) ){
                        _this.selectdFn( _this.option.storeData( $( this.target ) ) , target ,_arrs);
                    }
                break;
            }
        },
        /*获取下拉第一个默认选项值*/
        sDefault:function( target ){
            return {
                value : $( target ).find('option:first').val() ,
                text  : $( target ).find('option:first').text()
            }
        },
        /*禁用选项*/
        sDisabled:function( target ){

           var _target = target.nextAll(),
               _this = this
           ;
            _this.htmlClear( _target );
            _target.attr('disabled', true ).addClass('btn-disabled');
        },
        /*清除下拉选项*/
        htmlClear:function( targets ){
            var _this = this ;
            $( targets ).each(function(){
                var _self = $(this) ,
                    _default = _this.sDefault( _self )
                ;
                _this.htmlRender( _self , _default );
            });
        },
        /*渲染下拉选项*/
        htmlRender:function( target , _default , data ){
            var _html = '<option value="'+ _default.value +'" >'+ _default.text +'</option>';

            target.attr('disabled', false ).removeClass('btn-disabled');

            if( data ){
                for( var key in data ){
                     _html += '<option value="'+ key +'" >'+ data[key] +'</option>';
                }
            }

            target.html( _html );
        }
    };

})(jQuery,window);
