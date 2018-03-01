
var WxParse = require('../../../wxParse/wxParse.js');

var app=getApp();

Page({

    data: {

        search_val: null,
        search_data: [],
        search_sum_data_page: 0,
        search_sum_data_num: 0,
        search_page_start: 0,
        search_page_end: 3,
        search_current_page: 0,
        // 解析标签
        analyze_tab: [],
        analyze_tab_dec: [],
        analyze_tab_num:[]

    },
    onLoad: function (options) {

        this.setData({
            search_val: options.search_val
        });
        this.get_search_data();
    },
    onReachBottom:function(e){

        var that=this;

        var current_page = that.data.search_current_page + 1;

        

        if ((current_page < that.data.search_sum_data_page)) {

            wx.showToast({
                title: '加载中！',
                icon: 'loading'
            });
            that.get_search_data(current_page);

        } else if ((current_page > that.data.search_sum_data_page)) {
            wx.showToast({
                title: '数据已加载完',
                icon: 'loading',
                duration: 1000
            });
            return;
        } 

        that.setData({
            search_current_page: current_page
        });

    },
    get_search_data: function (current_page){

        var that=this;
       
        if (!current_page) {
            current_page = 0;
        }
        var page_start = that.data.search_page_end * current_page;
        var page_end = that.data.search_page_end;


        wx.showToast({
            title: '加载中',
            icon:'loading'
        });

        wx.request({
            url: app.globalData.url +'index.php?g=&m=api&a=search_api' ,
            data:{
                search_val: that.data.search_val,
                page_start: page_start,
                page_end: page_end,
                lng: app.globalData.location.longitude,
                lat: app.globalData.location.latitude
            },
            success:function(res){

                wx.hideToast();
                if (res.data.status == 1 && res.data.data) {

                    var old_data = that.data.search_data;

                    var res_data = res.data.data.data;

                    var distance = [];

                    var analyze_tab = that.data.analyze_tab;

                    var analyze_tab_num = that.data.analyze_tab_num;

                    var analyze_tab_dec = that.data.analyze_tab_dec;



                    for (var i = 0; i < res_data.length; i++) {

                        analyze_tab.push(res_data[i].activity_title);

                        analyze_tab_num.push(res_data[i].apply_num);

                        analyze_tab_dec.push(res_data[i].activity_dec)

                        old_data.push(res_data[i]);

                        distance.push({
                            latitude: res_data[i].lat,
                            longitude: res_data[i].lng
                        });

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

                    // 距离计算
                    // app.globalData.qqmapsdk.calculateDistance({
                    //     to: distance,
                    //     success: function (res) {

                    //         for (var i = 0; i < distance.length; i++) {

                    //             res_data[i].distance = (Number(res.result.elements[i].distance) / 1000).toFixed(2);

                    //         }
                    //     },
                    //     fail: function (res) {

                    //     }
                    // });

                    if (current_page == 0) {

                        that.setData({
                            search_data: res_data,
                            search_sum_data_page: res.data.data.page.sum_data_page,
                            search_sum_data_num: res.data.data.page.sum_data_num
                        });

                    } else {
                        // for (var i = 0; i < res_data.length;i++){

                        //     old_data.push(res_data[i]);
                        // }
                        that.setData({
                            search_data: old_data
                        });

                    }

                }
            }


        });
    },
    tab_actdetails: function (e) {

        wx.navigateTo({
            url: '/pages/activity/details/index?id=' + e.currentTarget.dataset.id
        });
    },
    onPullDownRefresh: function (e) {
        var that=this;
        wx.stopPullDownRefresh();

        that.setData({
            search_data: [],
            search_sum_data_page: 0,
            search_sum_data_num: 0,
            search_page_start: 0,
            search_page_end: 3,
            search_current_page: 0,
            // 解析标签
            analyze_tab: [],
            analyze_tab_dec: [],
            analyze_tab_num: []
        });

        that.get_search_data();
    },
    search: function (e) {

        var that=this;

        var search_val = e.detail.value.search_val;

        if (search_val == '') {

            wx.showToast({
                title: '请输入查询活动',
                icon: 'loading',
                duration: 1000
            });
            return;

        }
        that.setData({
            search_val: search_val,
            search_data: [],
            search_sum_data_page: 0,
            search_sum_data_num: 0,
            search_page_start: 0,
            search_page_end: 3,
            search_current_page: 0,
            // 解析标签
            analyze_tab: [],
            analyze_tab_dec: [],
            analyze_tab_num: []
        });

        that.get_search_data();
       
    },
    search_act: function (e) {
        var that = this;
        var search_val = e.detail.value;
        if (search_val == '') {

            wx.showToast({
                title: '请输入查询活动',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        that.setData({
            search_val: search_val,
            search_data: [],
            search_sum_data_page: 0,
            search_sum_data_num: 0,
            search_page_start: 0,
            search_page_end: 3,
            search_current_page: 0,
            // 解析标签
            analyze_tab: [],
            analyze_tab_dec: [],
            analyze_tab_num: []
        });
        that.get_search_data();
    },

})