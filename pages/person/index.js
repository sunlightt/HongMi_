
var WxParse = require('../../wxParse/wxParse.js');

var app = getApp();
var tab_style = ['active', '', ''];
var publish_data_onoff = true;
var join_data_onoff = true;


Page({
    data: {

        get_formid: true,
        user_inf: null,
        save_status: false,
        form_id: null,
        tab_style: tab_style,
        tab_index: 0,
        publish_data: [],
        publish_sum_data_page: 0,
        publish_sum_data_num: 0,
        publish_page_start: 0,
        publish_page_end: 10,
        publish_current_page: 0,
        // 解析标签
        analyze_tab: [],

        join_data: [],
        join_sum_data_page: 0,
        join_sum_data_num: 0,
        join_page_start: 0,
        join_page_end: 10,
        join_current_page: 0,
        join_analyze_tab: [],
    },
    onLoad: function (option) {

        var that = this;

        // 获取用户信息
        that.get_userinf();

        // 是否变更了活动
        if (wx.getStorageSync('act_change')) {
            wx.removeStorageSync('act_change');
            for (var i = 0; i < tab_style.length; i++) {
                tab_style[i] = '';
            }
            tab_style[1] = 'active';
            that.setData({
                tab_style: tab_style,
                tab_index: 1
            });
            publish_data_onoff = false;
            that.getpublish_act();
        } else if (wx.getStorageSync('act_publish')) {

            // 发布活动成功
            wx.removeStorageSync('act_publish');
            for (var i = 0; i < tab_style.length; i++) {
                tab_style[i] = '';
            }
            tab_style[1] = 'active';
            that.setData({
                tab_style: tab_style,
                tab_index: 1
            });
            publish_data_onoff = false;
            that.getpublish_act();
        }
    },
    onShow:function(){
        app.aldstat.sendEvent('我');
    },
    onReachBottom: function (e) {

        var that = this;

        var current_page = null;
        var join_current_page = null;

        if (that.data.tab_index == 1) {

            current_page = that.data.publish_current_page + 1;

        } else {
            join_current_page = that.data.join_current_page + 1;
        }

        if ((that.data.tab_index == 1) && (current_page < that.data.publish_sum_data_page)) {

            wx.showToast({
                title: '加载中',
                // icon: 'loading',
                image: '/img/tip.png'
            });
            that.getpublish_act(current_page);

        } else if (that.data.tab_index == 1 && (current_page > that.data.publish_sum_data_page)) {
            wx.showToast({
                title: '数据已加载完',
                icon: 'loading',
                duration: 1000
            });
            return;
        } else if ((that.data.tab_index == 2) && (join_current_page < that.data.join_sum_data_page)) {

            wx.showToast({
                title: '加载中！',
                icon: 'loading'
            });

            that.get_joinact(join_current_page);

        } else if ((that.data.tab_index == 2) && (join_current_page > that.data.join_sum_data_page)) {
            wx.showToast({
                title: '数据已加载完',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        that.setData({
            publish_current_page: current_page,
            join_current_page: join_current_page

        });
    },
    get_formid: function (e) {

        var that = this;
        for (var i = 0; i < tab_style.length; i++) {
            tab_style[i] = '';
        }
        tab_style[e.detail.value.index] = 'active';
        if (join_data_onoff) {
            wx.showToast({
                title: '加载中',
                icon: 'loading'
            });
            join_data_onoff = false;
            that.setData({
                tab_style: tab_style,
                tab_index: e.detail.value.index,
                form_id: e.detail.formId,
                get_formid: false
            });

            that.get_joinact();

        } else {
            that.setData({
                tab_style: tab_style,
                tab_index: e.detail.value.index
            });
        }
    },
    tab_section: function (e) {
        var that = this;
        for (var i = 0; i < tab_style.length; i++) {
            tab_style[i] = '';
        }
        tab_style[e.currentTarget.dataset.index] = 'active';
        that.setData({
            tab_style: tab_style,
            tab_index: e.currentTarget.dataset.index
        });

		//
        if (e.currentTarget.dataset.index == 1 && publish_data_onoff) {

            publish_data_onoff = false;

            that.getpublish_act();
            wx.showToast({
                title: '加载中',
                icon: 'loading'
            });

        }

        //  else if (e.currentTarget.dataset.index == 2 && join_data_onoff) {

        //     join_data_onoff = false;

        //     that.get_joinact();
        // }
    },
    get_userinf: function (e) {

        var that = this;
        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=my_user_info',
            data: {
                user_openid: wx.getStorageSync('openid')
            },
            success: function (res) {
                if (res.data.status == 1) {
                    that.setData({
                        user_inf: res.data.data

                    });
                    if (res.data.data.is_get_unionid==2){

                        wx.getUserInfo({
                            success:function(res){

                                var encryptedData = res.encryptedData;
                                var iv = res.iv;
                                var session_key = wx.getStorageSync('session_key');

                                wx.request({
                                    url: app.globalData.url + 'index.php?g=&m=api&a=bind_user_unionid',
                                    data:{
                                        encryptedData:encodeURIComponent(encryptedData),
                                        iv:encodeURIComponent(iv),
                                        session_key:encodeURIComponent(session_key) 
                                    },
                                    success:function(res){

                                        console.log(res);
                                        
                                    }
                                })

                                 console.log(res);


                            }
                        });
                    }
                }
            }
        });
    },
    getpublish_act: function (current_page) {
        var that = this;
        if (!current_page) {
            current_page = 0;
        }
        var page_start = that.data.publish_page_end * current_page;
        var page_end = that.data.publish_page_end;
        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=my_publish_list_api',
            method: 'GET',
            data: {
                user_openid: wx.getStorageSync('openid'),
                page_start: page_start,
                page_end: page_end
            },
            success: function (res) {
                if (res.data.status == 1 && res.data.data) {

                    wx.hideToast();

                    var old_data = that.data.publish_data;

                    var analyze_tab = that.data.analyze_tab;

                    var res_data = res.data.data.data;

                    for (var i = 0; i < res_data.length; i++) {

                        analyze_tab.push(res_data[i].apply_num);

                        old_data.push(res_data[i]);

                    }

                    for (let i = 0; i < analyze_tab.length; i++) {
                        WxParse.wxParse('reply' + i, 'html', analyze_tab[i], that);
                        if (i === analyze_tab.length - 1) {
                            WxParse.wxParseTemArray("replyTemArray", 'reply', analyze_tab.length, that)
                        }
                    }

                    if (current_page == 0) {

                        that.setData({

                            publish_data: res_data,
                            publish_sum_data_page: res.data.data.page.sum_data_page,
                            publish_sum_data_num: res.data.data.page.sum_data_num

                        });

                    } else {
                        // for (var i = 0; i < res_data.length;i++){

                        //     old_data.push(res_data[i]);
                        // }
                        that.setData({
                            publish_data: old_data
                        });

                    }
                }
            }
        })
    },
    // 参与活动
    get_joinact: function (current_page) {
        var that = this;
        if (!current_page) {
            current_page = 0;
        }
        var page_start = that.data.join_page_end * current_page;
        var page_end = that.data.join_page_end;

        var lng = null;
        var lat = null;

        console.log(wx.getStorageSync('location'));

        console.log(app.globalData.location);

        if (!app.globalData.location) {
            lng = 116.29845;
            lat = 39.95933;
        } else {
            lng = app.globalData.location.longitude;
            lat = app.globalData.location.latitude;
        }

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=my_join_list_api',
            method: 'GET',
            data: {
                user_openid: wx.getStorageSync('openid'),
                page_start: page_start,
                page_end: page_end,
                lng: lng,
                lat: lat,
                form_id: that.data.form_id
            },
            success: function (res) {
                wx.hideToast();
                if (res.data.status == 1 && res.data.data) {

                    var old_data = that.data.join_data;

                    var res_data = res.data.data.data;

                    var distance = [];

                    var analyze_tab = that.data.join_analyze_tab;


                    for (var i = 0; i < res_data.length; i++) {

                        analyze_tab.push(res_data[i].apply_num);

                        old_data.push(res_data[i]);

                        distance.push({
                            latitude: res_data[i].lat,
                            longitude: res_data[i].lng
                        });

                    }

                    for (let i = 0; i < analyze_tab.length; i++) {
                        WxParse.wxParse('reply' + i, 'html', analyze_tab[i], that);
                        if (i === analyze_tab.length - 1) {
                            WxParse.wxParseTemArray("replyTemArray1", 'reply', analyze_tab.length, that)
                        }
                    }
                    if (current_page == 0) {

                        that.setData({

                            join_data: res_data,
                            join_sum_data_page: res.data.data.page.sum_data_page,
                            join_sum_data_num: res.data.data.page.sum_data_num

                        });

                    } else {
                        that.setData({
                            join_data: old_data
                        });

                    }

                }
            }
        })
    },
    tab_actdetails: function (e) {
        console.log(e);
        if (e.currentTarget.dataset.status != 1) {

            wx.showToast({
                title: '活动已结束',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/activity/details/index?id=' + e.currentTarget.dataset.id
        });
    },
    same_activity: function (e) {
        app.aldstat.sendEvent('相似活动');
        wx.navigateTo({
            url: '/pages/publish/publish_success/index?id=' + e.currentTarget.dataset.id + '&entry=same_activity' + '&invi_openid=' + e.currentTarget.dataset.invi_openid
        });
    },
    change_activity: function (e) {
        var that = this;
        if (wx.getStorageSync('openid') != e.currentTarget.dataset.pblish_openid && e.currentTarget.dataset.act_status == 1) {
            wx.showToast({
                title: '您不是发布者',
                icon: 'loading',
                duration: 1000
            });
            return;
        } else if (e.currentTarget.dataset.act_status != 1) {
            wx.showToast({
                title: '活动已结束',
                icon: 'loading',
                duration: 1000
            });
            return;
        }
        // that.setData({
        //     publish_data: [],
        //     publish_sum_data_page: 0,
        //     publish_sum_data_num: 0,
        //     publish_page_start: 0,
        //     publish_page_end: 2,
        //     publish_current_page: 0
        // });
        wx.navigateTo({
            url: '/pages/activity/change_act/index?id=' + e.currentTarget.dataset.id
        });
    },
    attention:function(e){
      
        app.aldstat.sendEvent('关注报名通知');

    },
    examine: function (e) {

        app.aldstat.sendEvent('管理活动');

        if (e.currentTarget.dataset.status == '0' && e.currentTarget.dataset.act_status == 1) {
            wx.showToast({
                title: '无待审核人员',
                icon: 'loading',
                duration: 1000
            });
            return;
        } else if (e.currentTarget.dataset.act_status != 1) {
            wx.showToast({
                title: '活动已结束',
                icon: 'loading',
                duration: 1000
            });
            return;
        }

        if (e.currentTarget.dataset.pblish_openid == wx.getStorageSync('openid')) {

            wx.navigateTo({
                url: '/pages/activity/audit/index?id=' + e.currentTarget.dataset.id + '&pblish_openid=' + e.currentTarget.dataset.pblish_openid
            });
        } else {
            wx.navigateTo({
                url: '/pages/activity/member/index'
            });
        }
    },
    contact:function(e){

        app.aldstat.sendEvent('意见反馈');

    },
    formSubmit: function (e) {

        app.aldstat.sendEvent('保存名片');

        var that = this;
        var name = e.detail.value.username;
        var company = e.detail.value.company;
        var school = e.detail.value.school;
        var vocation = e.detail.value.wrok;
        var wx_num = e.detail.value.weixin;
        var mobile = e.detail.value.number;
        var resource = e.detail.value.resource;
        var need = e.detail.value.need;

        var send_data = {
            user_openid: wx.getStorageSync('openid'),
            name: name,
            company: company,
            school: school,
            vocation: vocation,
            wx_num: wx_num,
            mobile: mobile,
            resource: resource,
            need: need,
        };

        if (name == '') {

            delete send_data['name'];

        } else if (company == '') {

            delete send_data['company'];

        } else if (school == '') {

            delete send_data['school'];

        } else if (vocation == '') {

            delete send_data['vocation'];

        } else if (wx_num == '') {

            delete send_data['wx_num'];

        } else if (mobile == '') {

            delete send_data['mobile'];

        } else if (resource == '') {

            delete send_data['resource'];

        } else if (need == '') {

            delete send_data['need'];

        }
        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=edit_my_user_info',
            data: send_data,
            success: function (res) {
                if (res.data.status == 1) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'loading',
                        duration: 1000
                    });
                    that.setData({
                        save_status: true
                    });
                } else {
                    wx.showToast({
                        title: '保存失败',
                        icon: 'loading',
                        duration: 1000
                    });
                }
            }
        });
    },
    getPhoneNumber: function (e) {
        var that=this;
        var user_inf = that.data.user_inf;
        var iv = e.detail.iv;
        var encryptedData = e.detail.encryptedData;
        if (e.detail.errMsg != 'getPhoneNumber:fail user deny'){

            wx.request({
                url: app.globalData.url + 'index.php?g=&m=api&a=get_user_mobile',
                data: {
                    encryptedData: encodeURIComponent(encryptedData),
                    iv: encodeURIComponent(iv),
                    session_key: encodeURIComponent(wx.getStorageSync('session_key'))
                },
                success: function (res) {

                    wx.showToast({
                        title: '认证成功',
                        icon: 'loading',
                        duration: 1000
                    });

                    user_inf.mobile = res.data.data;
                    that.setData({
                        user_inf: user_inf
                    });
                }
            });
        }
    },
    onPullDownRefresh: function (e) {

        wx.stopPullDownRefresh();
        var that = this;
        if (that.data.tab_index == 0) {

            that.setData({
                user_inf: null,
                ave_status: false
            });

            that.get_userinf();

        } else if (that.data.tab_index == 1) {
            that.setData({
                publish_data: [],
                publish_sum_data_page: 0,
                publish_sum_data_num: 0,
                publish_page_start: 0,
                publish_page_end: 3,
                publish_current_page: 0,
                // 解析标签
                analyze_tab: []
            });
            that.getpublish_act();
        } else if (that.data.tab_index == 2) {
            that.setData({
                join_data: [],
                join_sum_data_page: 0,
                join_sum_data_num: 0,
                join_page_start: 0,
                join_page_end: 2,
                join_current_page: 0,
                join_analyze_tab: []
            });
            that.get_joinact();
        }
    }

});