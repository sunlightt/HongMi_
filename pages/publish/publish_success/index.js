
var WxParse = require('../../../wxParse/wxParse.js');
var app=getApp();

Page({

    data:{
        act_id:null,
        act_data: [],
        act_sum_data_page: 0,
        act_sum_data_num: 0,
        act_page_start: 0,
        act_page_end: 10,
        act_current_page: 0,
        // 解析标签
        analyze_tab: [],
        analyze_tab_dec:[],
        analyze_tab_num: [],

        // 邀请者openid
        invi_openid:null

    },
    onLoad:function(options){

        this.setData({

            act_id: options.id,
            entry: options.entry,
            invi_openid: options.invi_openid

        });

        this.get_same_act();

    },
    onReachBottom: function (e) {

        var that = this;

        var current_page = that.data.act_current_page + 1;

        if ((current_page < that.data.act_sum_data_page)) {

            wx.showToast({
                title: '加载中！',
                icon: 'loading'
            });
            
            that.get_same_act(current_page);

        } else if ((current_page > that.data.act_sum_data_page)) {
            wx.showToast({
                title: '数据已加载完',
                icon: 'loading',
                duration: 1000
            });
            return;
        }

        that.setData({
            act_current_page: current_page
        });

    },
    get_same_act:function (current_page){


        var that=this;

        if (!current_page) {
            current_page = 0;
        }
        var page_start = that.data.act_page_end * current_page;
        var page_end = that.data.act_page_end;

        wx.showToast({
            title: '加载中',
            icon: 'loading'
        });
        wx.request({
            url: app.globalData.url +'index.php?g=&m=api&a=alike_activity_api',
            data:{

                id:that.data.act_id,
                page_start: page_start,
                page_end: page_end,
                lng: app.globalData.location.longitude,
                lat: app.globalData.location.latitude
            },
            success:function(res){

                wx.hideToast();

                if (res.data.status == 1 && res.data.data) {

                    var old_data = that.data.act_data;

                    var res_data = res.data.data.data;

                    var distance = [];

                    var analyze_tab = that.data.analyze_tab;

                    var analyze_tab_num = that.data.analyze_tab_num;

                    var analyze_tab_dec = that.data.analyze_tab_dec;


                    for (var i = 0; i < res_data.length; i++) {

                        analyze_tab.push(res_data[i].activity_title);

                        analyze_tab_num.push(res_data[i].apply_num);

                        analyze_tab_dec.push(res_data[i].activity_dec);

                        old_data.push(res_data[i]);

                    }

                    for (let i = 0; i < analyze_tab.length; i++) {

                        WxParse.wxParse('reply' + i, 'html', analyze_tab[i], that);

                        WxParse.wxParse('reply1' + i, 'html', analyze_tab_num[i], that);

                        WxParse.wxParse('reply2' + i, 'html', analyze_tab_dec[i], that);

                        if (i === analyze_tab.length - 1) {

                            WxParse.wxParseTemArray("replyTemArray", 'reply', analyze_tab.length, that);

                            WxParse.wxParseTemArray("replyTemArray1", 'reply1', analyze_tab_num.length, that);

                            WxParse.wxParseTemArray("replyTemArray2", 'reply2', analyze_tab_dec.length, that);

                        }
                    }
                    if (current_page == 0) {

                        that.setData({
                            act_data: res_data,
                            act_sum_data_page: res.data.data.page.sum_data_page,
                            act_sum_data_num: res.data.data.page.sum_data_num
                        });

                    } else {
                        // for (var i = 0; i < res_data.length;i++){

                        //     old_data.push(res_data[i]);
                        // }
                        that.setData({
                            act_data: old_data
                        });

                    }

                }
            }
        });

    },
    tab_actdetails: function (e) {
        app.aldstat.sendEvent('呼朋唤友');
        wx.navigateTo({
            url: '/pages/activity/details/index?id=' + e.currentTarget.dataset.id
        });
    },
    invite_friend:function(e){
        app.aldstat.sendEvent('邀请TA');
        var that=this;
        wx.navigateTo({
            url: '/pages/activity/member/index?id=' + e.currentTarget.dataset.id + '&invi_id=' + that.data.act_id + '&invi_openid=' + that.data.invi_openid
        });
    },
    my_plublish_act:function(e){

        wx.setStorageSync('act_publish', true);
        wx.switchTab({
            url: '/pages/person/index',
        });

    },
    onPullDownRefresh:function(e){
        
        wx.stopPullDownRefresh();

        var that=this;
        that.setData({
            act_data: [],
            act_sum_data_page: 0,
            act_sum_data_num: 0,
            act_page_start: 0,
            act_page_end: 3,
            act_current_page: 0,
            // 解析标签
            analyze_tab: [],
            analyze_tab_dec: [],
            analyze_tab_num: []
            
        });

        that.get_same_act();
    }

})