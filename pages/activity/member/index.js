
var app = getApp();
Page({

    data: {


        all_member: [],
        current_view: 0,
        current_member: 0,
        all_member_len: 0,
        scroll_left: 0,
        scroll_width: 0,

        act_id: null,
        member_card_inf: [],
        member_head_inf: [],

        // 邀请活动id
        invi_id: null,
        invi_id_onoff: false,
        //invi_openid 邀请者openid
        invi_openid:null,

        // 当前浏览者是否报名参加了活动  是否是队员

        is_member:false

    },
    onLoad: function (option) {

        var that = this;

        var current_mem_len = 5;

        var all_member_len = 10;

        var all_member = that.data.all_member;

        that.setData({
            act_id: option.id
        });
        
		 
        if (option.invi_id) {

            that.setData({

                invi_id: option.invi_id,
                invi_openid: option.invi_openid,
                invi_id_onoff: true
            });
        } 

        that.get_member_inf();
    },
    get_member_inf: function (res) {

        var that = this;

        var current_mem_len = 5;

        var all_member_len = 10;

        var all_member = that.data.all_member;

        var member_head_inf = that.data.member_head_inf;

		console.log('ceshi');

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_team_user_api',
            data: {

                id: that.data.act_id,
                user_openid: wx.getStorageSync('openid')
            },
            success: function (res) {

                if (res.data.status == 1) {

                    var data = res.data.data.bottom;
                    var len = res.data.data.top.length;

                    var top_data = res.data.data.top;

					console.log(data);


                    for (var i = 0; i < top_data.length;i++){

                        if (top_data[i].user_openid == wx.getStorageSync('openid')){

                              that.setData({

                                  is_member:true
                              })

                        }
                    }

                    for (var i = 0; i < data.length; i++) {
                       
                        if (i == 0 && i < data.length) {
                            data[i].img_src = '/img/head.png';
                            data[i].style = 'active';
                            // member_head_inf.push({ 'img_src': '/img/head.png', 'style': 'active' });
                        } else if (i < data.length) {
                            data[i].img_src = '/img/head.png';
                            data[i].style = 'default';

                            // member_head_inf.push({ 'img_src': '/img/head.png', 'style': 'default' });
                        } else {
                            data[i].img_src = '/img/head.png';
                            data[i].style = '';
                            // member_head_inf.push({ 'img_src': '/img/site.png', 'style': '' });
                        }
                    }

                    that.setData({
                        member_card_inf: res.data.data.top,
                        member_head_inf: data,
                        all_member: res.data.data.top,
                        current_member: len,
                        all_member_len: len,
                        scroll_width: len * 58
                    });
                }
            }
        });
    },
    change_view: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var all_member = that.data.member_head_inf;
        var current_head_index = e.detail.current;
        var scroll_left = 0;

        all_member[index].style = 'default';
        all_member[e.detail.current].style = 'active';
        if (current_head_index > 5) {
            scroll_left = Number((current_head_index - 5) * 50)
        } else {
            scroll_left = 0;
        }

        this.setData({
            current_view: e.detail.current,
            scroll_left: scroll_left,
            member_head_inf: all_member
        });
    },
    pre: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;

        var all_member = that.data.all_member;

        all_member[index].style = '';

        if (index == 0) {
            wx.showToast({
                title: '没有更多人了',
                icon: 'loading',
                duration: 1000
            });
            return;
            // index = that.data.current_member-1;
        } else {
            index--;
        }

        all_member[index].style = 'active';

        this.setData({
            current_view: index
        });
    },
    nex: function (e) {

        var that = this;
        var index = e.currentTarget.dataset.index;
        var all_member = that.data.all_member;
        all_member[index].style = '';

        if (index == that.data.current_member - 1) {
            // index = 0;
            wx.showToast({
                title: '没有更多人了',
                icon: 'loading',
                duration: 1000
            });
            return;
        } else {
            index++;
        }
        all_member[index].style = 'active';

        this.setData({
            current_view: index
        });
    },
    tab_view:function(e){

        app.aldstat.sendEvent('切换成员名片');

        var that=this;

        var user_id = e.currentTarget.dataset.id;

        var member_card_inf = that.data.member_card_inf;  

        var current_view_index=0;

        for (var i = 0; i < member_card_inf.length;i++){

            if (member_card_inf[i].user_id == user_id){

                current_view_index=i;

            }
        }
        
        this.setData({
            current_view: current_view_index
        });

    },
    copy: function (e) {
        app.aldstat.sendEvent('复制手机');
        wx.setClipboardData({
            data: e.currentTarget.dataset.text,
            success: function (res) {
                wx.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 1000
                });
            },
            fail: function (res) {
                wx.showToast({
                    title: '复制失败',
                    icon: 'success',
                    duration: 1000
                });
            }
        })
    },
    invi_friend: function (e) {
        var that = this;
        app.aldstat.sendEvent('邀请');

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=send_wx_invite_api',
            method: 'GET',
            data: {
                id: that.data.invi_id,
                template_id: '7yh3Gsg9tgOhsJzcbKnjD-gH6NIEwFBnuJfrnHbEU6U',
                page: '/pages/activity/details/index?id=' + that.data.invi_id,
                user_openid: e.currentTarget.dataset.user_openid
            },
            success: function (res) {

                console.log(res);

                if (res.data.status == 1) {

                    wx.showToast({
                        title: '邀请已发出',
                        icon: 'loading',
                        duration: 1000
                    });

                } else {
                    wx.showToast({
                        title: '邀请发出失败',
                        icon: 'loading',
                        duration: 1000
                    });
                }

            }
        });

    },
    onPullDownRefresh: function (e) {

        wx.stopPullDownRefresh();

        var that = this;

        that.setData({
            all_member: [],
            current_view: 0,
            current_member: 0,
            all_member_len: 0,
            scroll_left: 0,
            scroll_width: 0,

            member_card_inf: [],
            member_head_inf: []
        });

        that.get_member_inf();

    },
    onTabItemTap: function (item) {
        console.log(item);
    }
});