
var app = getApp();
Page({
    data: {

        all_member: [],
        current_view: 0,
        current_member: 0,
        all_member_len: 0,
        scroll_left: 0,
        scroll_width: 0,

        member_card_inf: [],
        member_head_inf: [],
        // 通过人数长度
        pass_member: null,
        pass_member_inf_data: [],
        // 当前目标头像索引值
        current_head_index: 0
    },
    onLoad: function (option) {

        var that = this;

        var current_mem_len = 5;

        var all_member_len = 10;

        var all_member = that.data.all_member;

        for (var i = 0; i < all_member_len; i++) {
            if (i == 0 && i < current_mem_len) {
                all_member.push({ 'img_src': '/img/head.png', 'style': 'active' });
            } else if (i < current_mem_len) {
                all_member.push({ 'img_src': '/img/head.png', 'style': 'default' });
            } else {
                all_member.push({ 'img_src': '/img/site.png', 'style': '' });
            }
        }
        that.setData({
            // all_member: all_member,
            // current_member: current_mem_len,
            // all_member_len: all_member_len,
            // scroll_width: all_member_len * 58,
            act_id: option.id,
            pblish_openid: option.pblish_openid
        });

        that.get_audit_inf();

    },
    change_view: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var all_member = that.data.all_member;
        var member_card_inf = that.data.member_card_inf;
        var pass_member_inf_data = that.data.pass_member_inf_data;
        var current_head_index = 0;
        var scroll_left = 0;

        for (var i = 0; i < pass_member_inf_data.length; i++) {
            if (member_card_inf[e.detail.current].user_openid == pass_member_inf_data[i].user_openid) {
                all_member[i].img_src = pass_member_inf_data[i].head_img;
                all_member[i].style = 'active';
                current_head_index = i;
            } else {

                all_member[i].style = 'default';
            }
        }

        if (current_head_index > 5) {
            scroll_left = Number((current_head_index - 5) * 50)
        } else {
            scroll_left = 0;
        }

        this.setData({
            current_view: e.detail.current,
            scroll_left: scroll_left,
            all_member: all_member
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
    get_audit_inf: function (res) {

        var that = this;

        var current_mem_len = 5;

        var all_member_len = 10;

        var all_member = [];

        var member_head_inf = [];

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_wait_check_api',
            data: {
                user_openid: wx.getStorageSync('openid'),
                id: that.data.act_id
            },
            success: function (res) {
                if (res.data.status == 1) {

                    var data = res.data.data.bottom;

                    // 总人数
                    var member_len = Number(data[0].num);

                    var len = res.data.data.top.length;

                    // 当前报名人数
                    current_mem_len = res.data.data.bottom.length;

                    var pass_member = 0;

                    var pass_member_inf_data = that.data.pass_member_inf_data;

                    var member_card_inf = res.data.data.top;

                    // 当前目标头像索引值
                    var current_head_index = 0;

                    for (var i = 0; i < member_len; i++) {

                        all_member.push({ 'img_src': '/img/site.png', 'style': '' });

                    }
                    for (var i = 0; i < current_mem_len; i++) {

                        if (data[i].is_status == 1) {
                            pass_member = i;
                            pass_member_inf_data.push(data[i]);
                        }

                        
                    }

                    // for (var i = 0; i < current_mem_len; i++){
 
                    //     if (data[i].is_status == 1 && data[i].user_openid == member_card_inf[0].user_openid && i == 0) {
                    //         all_member[0].img_src = data[i].head_img;
                    //         all_member[0].user_id = data[i].user_id;
                    //         all_member[0].style = 'active';
                    //         current_head_index = i;

                    //     } else if (data[i].is_status == 1 && pass_member == 1 && data[0].is_status != 1) {
                    //         all_member[0].img_src = data[i].head_img;
                    //         all_member[0].user_id = data[i].user_id;
                    //         all_member[0].style = 'default';

                    //     }else {

                    //         all_member[i].img_src = data[i].head_img;
                    //         all_member[i].user_id = data[i].user_id;
                    //         all_member[i].style = 'default';

                    //     }  
                        
                    // }

                    console.log(pass_member_inf_data);

                    for (var i = 0; i < pass_member_inf_data.length; i++) {

                        if (pass_member_inf_data[i].is_status == 1 && pass_member_inf_data[i].user_openid == member_card_inf[0].user_openid && i == 0) {
                            all_member[0].img_src = pass_member_inf_data[i].head_img;
                            all_member[0].user_id = pass_member_inf_data[i].user_id;
                            all_member[0].style = 'active';
                            current_head_index = i;

                        } else {

                            all_member[i].img_src = pass_member_inf_data[i].head_img;
                            all_member[i].user_id = pass_member_inf_data[i].user_id;
                            all_member[i].style = 'default';

                        }

                    }

                    that.setData({
                        member_card_inf: member_card_inf,
                        member_head_inf: data,
                        all_member: all_member,
                        current_member: current_mem_len,
                        all_member_len: member_len,
                        scroll_width: member_len * 58,
                        pass_member: pass_member,
                        pass_member_inf_data: pass_member_inf_data,
                        current_head_index: current_head_index
                    });
                }
            }
        })

    },
    tab_view: function (e) {

        var that = this;

        var user_id = e.currentTarget.dataset.id;

        var member_card_inf = that.data.member_card_inf;

        var current_view_index = 0;

        for (var i = 0; i < member_card_inf.length; i++) {

            if (member_card_inf[i].user_id == user_id) {

                current_view_index = i;

            }
        }

        this.setData({
            current_view: current_view_index
        });

    },
    audit: function (e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        var index_target = e.currentTarget.dataset.index;
        var member_card_inf = that.data.member_card_inf;
        var pass_member_inf_data = that.data.pass_member_inf_data;

        // 当前目标头像索引值
        var current_head_index = 0;
        var all_member = that.data.all_member;

        var index = that.data.pass_member;

        var current_mem_len = that.data.current_mem_len;

        var data = that.data.member_head_inf;

        var scroll_left = 0;

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=my_publish_check_api',
            data: {
                id: that.data.act_id,
                founder_openid: that.data.pblish_openid,
                user_openid: e.currentTarget.dataset.user_openid,
                type: type,
                page: '/pages/activity/details/index?id=' + that.data.act_id,
            },
            success: function (res) {

                if (res.data.status == 1) {
                    var text = null;
                    if (type == 1) {
                        text = '审核成功';
                        member_card_inf[index_target].is_status = '1';
                        for (var i = 0; i < data.length; i++) {

                            if (data[i].user_openid == e.currentTarget.dataset.user_openid) {
                                pass_member_inf_data.push(data[i]);
                            }
                        }

                        console.log(pass_member_inf_data);

                        for (var i = 0; i < pass_member_inf_data.length; i++) {
                            
                            if (pass_member_inf_data[i].user_openid == e.currentTarget.dataset.user_openid) {
                                all_member[i].img_src = pass_member_inf_data[i].head_img;
                                all_member[i].user_id = pass_member_inf_data[i].user_id;
                                all_member[i].style = 'active';
                                current_head_index = 0;
                            } else {
                                all_member[i].user_id = pass_member_inf_data[i].user_id;
                                all_member[i].style = 'default';
                            }
                        }

                    } else {
                        text = '取消成功';
                        member_card_inf[index_target].is_status = '2';

                        // for (var i = 0; i < data.length; i++) {

                        //     if (data[i].user_openid == e.currentTarget.dataset.user_openid) {
                        //         pass_member_inf_data.splice(i, 1);
                        //     }
                        // }


                        for (var i = 0; i < pass_member_inf_data.length; i++) {

                            if (pass_member_inf_data[i].user_openid == e.currentTarget.dataset.user_openid) {

                                console.log(i);

                                // console.log('')

                                all_member[i].img_src = '/img/site.png';
                                all_member[i].user_id = ' ';
                                all_member[i].style = ' ';

                                pass_member_inf_data.splice(i, 1);

                                console.log(pass_member_inf_data);
                            }
                        }

                        if (pass_member_inf_data.length == 0) {
                            all_member[0].img_src = '/img/site.png';
                            all_member[0].style = ' ';
                        }

                        // for (var i = 0; i < pass_member_inf_data.length; i++) {

                        //     if (pass_member_inf_data[i].user_openid == e.currentTarget.dataset.user_openid) {
                        //         all_member[index].img_src = data[i].head_img;
                        //         all_member[i].user_id = data[i].user_id;
                        //         all_member[index].style = 'active';
                        //         current_head_index = i;
                        //     } else {
                        //         all_member[i].user_id = data[i].user_id;
                        //         all_member[index].style = 'default';
                        //     }

                        // }


                        console.log(pass_member_inf_data.length);
                        console.log(pass_member_inf_data);


                        for (var i = 0; i < pass_member_inf_data.length; i++) {

                            if (pass_member_inf_data[i].user_openid == e.currentTarget.dataset.user_openid) {
                                all_member[i].img_src = pass_member_inf_data[i].head_img;
                                all_member[i].user_id = pass_member_inf_data[i].user_id;
                                all_member[i].style = 'active';
                                current_head_index = i;
                            } else {
                                // all_member[i].user_id = pass_member_inf_data[i].user_id;
                                // all_member[index].style = 'default';

                                all_member[i].img_src = pass_member_inf_data[i].head_img;
                                all_member[i].user_id = pass_member_inf_data[i].user_id;
                                all_member[i].style = 'default';
                            }

                        }
                    }
                    wx.showToast({
                        title: text,
                        icon: 'loading',
                        duration: 1000
                    });

                    if (current_head_index > 5) {
                        scroll_left = Number((current_head_index - 5) * 50)
                    } else {
                        scroll_left = 0;
                    }

                    that.setData({
                        all_member: all_member,
                        member_card_inf: member_card_inf,
                        pass_member_inf_data: pass_member_inf_data,
                        scroll_left: scroll_left
                    });

                } else {
                    var text = null;
                    if (type == 1) {
                        text = '审核失败';
                    } else {
                        text = '取消失败';
                    }
                    wx.showToast({
                        title: text,
                        icon: 'loading',
                        duration: 1000
                    });
                }
            }
        })
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
            member_head_inf: [],
            // 通过人数长度
            pass_member: null,
            pass_member_inf_data: [],
            // 当前目标头像索引值
            current_head_index: 0
        });


        that.get_audit_inf();


    }
});