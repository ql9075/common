

/**
 * 邮箱地址自动补全
 *
 * @version v0.0.1
 * @date 2014-04-30
 *
 */

(function($) {
    var defaults = {
        cls: 'auto-complete',
        onshow: null,
        onhide: null,
        mailServ: ['qq.com','163.com','126.com','189.cn','sina.com','sina.cn','hotmail.com','gmail.com','sohu.com','jd.com']
    };

    function AutoComplete($el, options) {
        this.$el = $el;
        this.opts = options;
        this.init();
    }

    AutoComplete.prototype = {

        constructor: AutoComplete,

        init: function () {
            this.listen();
        },

        listen: function () {
            var me = this;

            me.$el.on({
                'keydown': function (e) {

                    var code = e.keyCode,
                        len = this.value.length,
                        _this = this;

                    if ( code === 38 || code === 40 || code === 13 || code === 27 ) {
                        if ( me.$list && me.$list.is(':visible') ) {
                            e.preventDefault(); //阻止chrome up arrow 快捷键
                            e.stopPropagation(); //阻止enter选择提交
                            me.keyboardSelect(code);
                        }
                    } else {
                        setTimeout(function(){
                            me.process(_this.value);
                        }, 200);
                    }
                },
                'mouseup': function() {
                    var _this = this;
                    if (_this.value === '') return;

                    //IE10 的删除按钮触发
                    setTimeout(function() {
                        if (_this.value === '') {
                            me.hideList();
                        }

                    }, 1);
                },
                change: function(){
                    !this.value && me.hideList();
                },
                'focus': function() {
                    //this.value && me.showList();
                },
                'blur': function () {
                    var _this = this;
                    setTimeout(function(){
                        _this.value && me.hideList();
                    }, 200);
                }
            });

            //窗口变化时，重新定位元素的位置
            $(window).on('resize', function() {
                setTimeout(function() {
                    me.pos();
                }, 200);
            });
        },

        process: function(val){
            var params = this.filterStr(val);

            if ( params.mailServs.length ) {
                this.render(params.str, params.mailServs, params.mobile);
            } else {
                this.destoryList();
            }
        },

        //处理输入的数据, 返回处理好的对象
        filterStr: function (val) {
            var mobileReg = /^1[3|4|5|7|8]/, //手机号码校验正则
                strSplit = '@', //分割符
                result = {}, //处理后的结果
                mailServs = this.opts.mailServ, //默认的邮箱域列表
                strSplitIndex, //分割符所在索引
                strBefore, //分割符的前半部分
                strAfter, //分隔符的后半部分
                tempArr; //处理后的邮箱域列表

            //初始化结果集    
            result.str = '';
            result.mailServs = [];

            if ( val ) {
                strSplitIndex = val.indexOf(strSplit);

                if ( strSplitIndex !== -1 ) {
                    strBefore = val.substring(0, strSplitIndex);
                    strAfter = val.substring(strSplitIndex+1);

                    tempArr = $.grep(mailServs, function(item){
                        return ( item.indexOf(strAfter) > -1 && strAfter !== item );
                    });

                    //显示过滤后的列表
                    result.str = strBefore;
                    result.mailServs = tempArr;
                } else {
                    //显示完整列表
                    result.str = val;
                    mobileReg.test(val) && (val.length < 14) && (result.mobile = val);
                    result.mailServs = mailServs;
                }
            }

            return result;
        },

        render: function (str, mailServs, mobile) {
            var html = [],
                me = this;

            if ( !this.$list ) {
                this.$list = $('<ul/>');
                this.$list.addClass(this.opts.cls);

                this.$list.delegate('li', 'click', function(){
                    me._select($(this).text());
                });

                //只定位一次
                this.$list.hide();

                $(document.body).append(this.$list);
            }

            if ( mobile ) {
                html.push('<li class="selected">' + mobile + '</li>');
            }

            $.each(mailServs, function (idx){
                var firstCls = (idx === 0 && !mobile) ? ' class="selected"' : '';

                html.push('<li' + firstCls + '>' + str + '@' + this + '</li>');
            });

            this.$list.html(html.join(''));
            this.pos();

            this.showList();
        },

        _select: function(val){
            this.$el.val(val);
            this.destoryList();
        },

        showList: function(){
            if ( this.$list && this.$list.is(':hidden') ) {
                this.$list.show();
                (typeof this.opts.onshow === 'function') && this.opts.onshow.call(this);
            }
        },

        hideList: function(){
            if ( this.$list && !this.$list.is(':hidden') ) {
                this.$list.hide();
                (typeof this.opts.onhide === 'function') && this.opts.onhide.call(this);
            }
        },

        destoryList: function(){
            var me = this;

            me.$list && (function(){
                me.$list.empty();
                me.hideList();
            })();
        },

        pos: function() {
            var offset = this.$el.offset();
            var left = offset.left;
            var top = offset.top + this.$el.outerHeight();

            this.$list && this.$list.css({
                position: 'absolute',
                width: this.$el.outerWidth(),
                zIndex: 9999,
                backgroundColor: '#fff',
                lineHeight: this.$el.outerHeight() + 'px',
                left: left,
                top: top
            });

            return this.$list;
        },

        keyboardSelect: function(code){
            var $cur = this.$list.find('.selected'),
                $next = $cur.next().length ? $cur.next() : this.$list.find('li:first'),
                $prev = $cur.prev().length ? $cur.prev() : this.$list.find('li:last'),
                cls = 'selected',
                val = $cur.text();

            switch (code) {
                //上键
                case 38:
                    $cur.removeClass(cls);
                    $prev.addClass(cls);
                    break;
                //下键
                case 40:
                    $cur.removeClass(cls);
                    $next.addClass(cls);
                    break;
                //回车键
                default:
                    this._select(val);
                    break;
            }

        }
    };

    $.fn.autoComplete = function(options) {
        var opts = $.extend({}, defaults, options);
        this.each(function() {
            new AutoComplete($(this), opts);
        });
        return this;
    };
})(jQuery);