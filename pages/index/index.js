
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();

var get_act_listonoff = true;
var get_localtion_onoff = true;
var openid = null;

Page({
    data: {
        act_data: [],
        act_data_sum_data_page: 0,
        act_data_sum_data_num: 0,
        act_data_page_start: 0,
        act_data_page_end: 10,
        act_data_current_page: 0,
        tip_msg: '还没有任何活动\n赶快去发布吧！',
        // 解析标签
        analyze_tab: [],
        distance_arr: [],

        showToast: true,
    },
    onLoad: function (option) {
        var that = this;

        this.getBanner();

        this.get_act_list();

        setTimeout(function () {

            that.setData({
                showToast: false
            });

        }, 3000);

    },
    onShow: function () {

        app.aldstat.sendEvent('我');
    },
    onReachBottom: function (e) {
        var that = this;
        var current_page = that.data.act_data_current_page + 1;
        if (current_page < that.data.act_data_sum_data_page) {
            wx.showToast({
                title: '加载中！',
                icon: 'loading'
            });
            that.get_act_list(current_page);
        } else {
            wx.showToast({
                title: '数据已加载完',
                icon: 'loading',
                duration: 1000
            });
        }
        that.setData({
            act_data_current_page: current_page
        });

    },
    get_act_list: function (current_page) {
        var that = this;
        if (!current_page) {
            current_page = 0;
        }

        var page_start = that.data.act_data_page_end * current_page;
        var page_end = that.data.act_data_page_end;

        if (get_act_listonoff) {
            get_act_listonoff = false;
            wx.login({
                success: function (res) {
                    if (res.code) {
                        wx.request({
                            //获取openid接口  
                            url: app.globalData.url + 'index.php?g=&m=api&a=get_openid_api',
                            header: {
                                'Content-Type': 'application/json'
                            },
                            data: {
                                code: res.code
                            },
                            method: 'GET',
                            success: function (response) {
                                if (response.data.status == 1) {
                                    wx.setStorageSync('openid', response.data.data.openid);
                                    wx.setStorageSync('session_key', response.data.data.session_key);
                                    wx.setStorageSync('unionid', response.data.data.unionid);
                                    app.globalData.openid = response.data.data.openid;
                                    openid = response.data.data.openid;
                                }
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg);
                    }
                }

            });
        }
        if (get_localtion_onoff) {
            get_localtion_onoff = false;
            wx.getLocation({
                type: 'gcj02',
                altitude: false,
                success: function (reslocation) {
                    app.globalData.location = reslocation;
                    wx.setStorageSync('location', reslocation);
                    wx.request({
                        url: app.globalData.url + 'index.php?g=&m=api&a=activity_list_api',
                        method: 'GET',
                        data: {
                            user_openid: openid,
                            page_start: page_start,
                            page_end: page_end,
                            lng: reslocation.longitude,
                            lat: reslocation.latitude
                        },
                        success: function (res) {
                            wx.hideToast();
                            that.setData({
                                showToast: false
                            });
                            if (res.data.status == 1 && res.data.data) {
                                var old_data = that.data.act_data;
                                var res_data = res.data.data.data;
                                // var distance = [];
                                // var analyze_tab = [];
                                // var distance_arr = [];

                                var distance = that.data.distance;
                                var analyze_tab = that.data.analyze_tab;
                                var distance_arr = that.data.distance_arr;



                                for (var i = 0; i < res_data.length; i++) {
                                    analyze_tab.push(res_data[i].apply_num);
                                    old_data.push(res_data[i]);
                                    // distance.push({
                                    //     latitude: res_data[i].lat,
                                    //     longitude: res_data[i].lng
                                    // });

                                }
                                for (let i = 0; i < analyze_tab.length; i++) {
                                    WxParse.wxParse('reply' + i, 'html', analyze_tab[i], that);
                                    if (i === analyze_tab.length - 1) {
                                        WxParse.wxParseTemArray("replyTemArray", 'reply', analyze_tab.length, that)
                                    }
                                }
                                if (current_page == 0) {
                                    that.setData({
                                        act_data: res_data,
                                        // distance_arr: distance_arr,
                                        act_data_sum_data_page: res.data.data.page.sum_data_page,
                                        act_data_sum_data_num: res.data.data.page.sum_data_num
                                    });
                                } else {
                                    that.setData({
                                        act_data: old_data
                                        // distance_arr: distance_arr
                                    });
                                }
                            }
                        }
                    })
                },
                fail: function () {


                    get_localtion_onoff = false;

                    that.setData({
                        tip_msg: "未获取到您的位置\n没有匹配到活动"
                    });

                }
            });

        } else {
            wx.request({
                url: app.globalData.url + 'index.php?g=&m=api&a=activity_list_api',
                method: 'GET',
                data: {
                    user_openid: openid,
                    page_start: page_start,
                    page_end: page_end,
                    lng: app.globalData.location.longitude,
                    lat: app.globalData.location.latitude
                },
                success: function (res) {
                    wx.hideToast();
                    if (res.data.status == 1 && res.data.data) {
                        var old_data = that.data.act_data;
                        var res_data = res.data.data.data;
                        // var distance = [];
                        // var analyze_tab = [];
                        // var distance_arr = [];

                        var distance = that.data.distance;
                        var analyze_tab = that.data.analyze_tab;
                        var distance_arr = that.data.distance_arr;



                        for (var i = 0; i < res_data.length; i++) {
                            analyze_tab.push(res_data[i].apply_num);
                            old_data.push(res_data[i]);
                            // distance.push({
                            //     latitude: res_data[i].lat,
                            //     longitude: res_data[i].lng
                            // });
                        }
                        for (let i = 0; i < analyze_tab.length; i++) {
                            WxParse.wxParse('reply' + i, 'html', analyze_tab[i], that);
                            if (i === analyze_tab.length - 1) {
                                WxParse.wxParseTemArray("replyTemArray", 'reply', analyze_tab.length, that)
                            }
                        }
                        // 距离计算
                        if (current_page == 0) {
                            that.setData({
                                act_data: res_data,
                                // distance_arr: distance_arr,
                                act_data_sum_data_page: res.data.data.page.sum_data_page,
                                act_data_sum_data_num: res.data.data.page.sum_data_num
                            });
                        } else {
                            that.setData({
                                act_data: old_data
                                // distance_arr: distance_arr
                            });
                        }

                    }
                }
            });
        }
    },
    search: function (e) {

        var search_val = e.detail.value.search_val;

        if (search_val == '') {

            wx.showToast({
                title: '请输入查询活动',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/activity/search/index?search_val=' + search_val
        });
    },
    search_act: function (e) {
        var search_val = e.detail.value;
        if (search_val == '') {

            wx.showToast({
                title: '请输入查询活动',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/activity/search/index?search_val=' + search_val
        });
    },
    tab_actdetails: function (e) {

        wx.navigateTo({
            url: '/pages/activity/details/index?id=' + e.currentTarget.dataset.id
        });
    },
    getBanner: function (e) {
        var that = this;
        wx.request({
            url: app.globalData.url + "index.php?g=&m=api&a=carousel_api",
            success: function (res) {
                if (res.data.status == 1) {
                    var banner_arr = res.data.data;
                    if (banner_arr.length > 5) {
                        banner_arr.splice(5, banner_arr.length - 1);
                    }
                    that.setData({
                        banner_arr: res.data.data
                    });
                } else {
                    banner_arr: ['/img/banner.png']
                }
            }
        });
    },
    tab_webview:function(e){

        var src=e.currentTarget.dataset.src;

        wx.navigateTo({
            url: '/pages/webview/index?http_src=' + src,
        })

    },
    onPullDownRefresh: function () {
        var that = this;
        wx.stopPullDownRefresh();
        that.setData({
            act_data: [],
            act_data_sum_data_page: 0,
            act_data_sum_data_num: 0,
            act_data_page_start: 0,
            act_data_page_end: 3,
            act_data_current_page: 0,
            tip_msg: '还没有任何活动\n赶快去发布吧！',
            analyze_tab: [],
            distance_arr: []
        });
        this.getBanner();
        this.get_act_list();
    },
    onShareAppMessage: function (e) {
        app.aldstat.sendEvent('分享');
        var that = this;
        return {
            title: that.data.act_data.title,
            path: '/pages/index/index',
            success: function (res) {
                wx.showToast({
                    title: '分享成功',
                    icon: 'loading',
                    duration: 1000
                });
            }
        }
    }
})
