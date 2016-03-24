/* popbox
 * @404nan
 * h5
 */

(function(window,$){

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
		
		//_class.push('popUp-layer');

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