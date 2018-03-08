var app = getApp();
Page({

    data: {
        act_id: null,
        act_data: null,
        sign_type: 1,
        app_code: false,
        code_src: null,
        share_status:false
    },
    onLoad: function (option) {
        
        this.setData({
            act_id: option.id
        });

        this.get_act_inf();
    },
    get_act_inf: function (e) {

        var that = this;
        if (!wx.getStorageSync('openid')){

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
                                    
                                    wx.request({
                                        url: app.globalData.url + 'index.php?g=&m=api&a=activity_details_api',
                                        data: {
                                            user_openid: response.data.data.openid,
                                            id: that.data.act_id
                                        },
                                        success: function (res) {

                                            if (res.data.status == 1) {

                                                that.setData({
                                                    act_data: res.data.data
                                                });

                                                wx.downloadFile({
                                                    url: res.data.data.founder_user_img,
                                                    success: function (down_res) {
                                                        wx.setStorageSync('founder_user_img', down_res.tempFilePath);
                                                    }
                                                });
                                                wx.downloadFile({
                                                    url: res.data.data.cover,
                                                    success: function (down_res) {
                                                        wx.setStorageSync('cover', down_res.tempFilePath);
                                                    }
                                                });
                                            }
                                        }
                                    })   
                                }
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg);
                    }
                }

            });

        }else{
            wx.request({
                url: app.globalData.url + 'index.php?g=&m=api&a=activity_details_api',
                data: {
                    user_openid: wx.getStorageSync('openid'),
                    id: that.data.act_id
                },
                success: function (res) {

                    if (res.data.status == 1) {

                        that.setData({
                            act_data: res.data.data
                        });

                        wx.downloadFile({
                            url: res.data.data.founder_user_img,
                            success: function (down_res) {
                                wx.setStorageSync('founder_user_img', down_res.tempFilePath);
                            }
                        });
                        wx.downloadFile({
                            url: res.data.data.cover,
                            success: function (down_res) {
                                wx.setStorageSync('cover', down_res.tempFilePath);
                            }
                        });
                    }
                }
            })
        }
        
    },
    back_home: function (e) {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    member_card: function (e) {
        app.aldstat.sendEvent('查看成员名片');
        wx.navigateTo({
            url: '/pages/activity/member/index?id=' + e.currentTarget.dataset.id
        });
    },
    signup: function (e) {
        var that = this;
        // var type = e.currentTarget.dataset.sign_type;
        var type = e.detail.value.type;
        var act_data = that.data.act_data;

        if (type == 1){
            app.aldstat.sendEvent('报名参加');
        }else{
            app.aldstat.sendEvent('取消报名');
        }

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_apply_or_cancel_api',
            data: {
                id: that.data.act_data.id,
                user_openid: wx.getStorageSync('openid'),
                type: type,
                form_id: e.detail.formId,
                page: '/pages/activity/audit/index?id=' + that.data.act_id
            },
            success: function (res) {
                if (res.data.status == 1) {
                    var text = null;
                    if (type == 1) {
                        text = '报名成功';
                        act_data.user_apply_status = 1;
                        that.setData({
                            act_data: act_data
                        });

                        if (!wx.getStorageSync('first_signUp')) {

                            wx.setStorageSync('first_signUp', true);

                            wx.showModal({
                                title: '已报名，请完善名片并等待审核',
                                content: '你没有完善个人名片，队长可能会拒绝你的报名，请前往设置。',
                                showCancel: true,
                                confirmText: '完善名片',
                                success: function (res) {
                                    if (res.confirm){
                                        wx.switchTab({
                                            url: '/pages/person/index'
                                        });
                                    }
                                }
                            });

                        } else {
                            wx.showModal({
                                title: '已报名，请关注公众号通知',
                                content: '打开“我的”页面，可关注公众号接收通知',
                                showCancel: false,
                                confirmText: '知道了',
                                success: function () {
                                    return;
                                }
                            });
                        }

                    } else {
                        text = '取消成功';
                        act_data.user_apply_status = 2;
                        that.setData({
                            act_data: act_data
                        });

                        wx.showToast({
                            title: text,
                            icon: 'loading',
                            duration: 1000
                        });

                    }

                } else {
                    var text = null;
                    if (type == 1) {
                        text = '报名失败';
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
    save_code: function (e) {
        var that = this;
        wx.downloadFile({
            url: that.data.code_src,
            success: function (res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (res) {
                        wx.showToast({
                            title: '保存成功',
                            icon:'loading',
                            duration:1000
                        });
                        that.setData({
                            app_code: false
                        });
                    },
                    fail: function (res) {
                        wx.showToast({
                            title: '保存失败',
                            icon: 'loading',
                            duration: 1000
                        });
                        that.setData({
                            app_code: false
                        });
                    }
                })
            },
            fail: function () {
                console.log('fail')
            }
        });
    },
    showaction:function(res){

        var that=this;

        that.setData({

            share_status:true

        });

    },
    cancel_share:function(res){

        this.setData({

            share_status: false

        });

    },
    share_friends:function(e){
        var that=this;
        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=get_wx_acode',
            data: {
                page: '/pages/activity/details/index?id=' + that.data.act_id,
                width: 430,
                auto_color: false,
                line_color: { 'r': '0', 'g': '0', 'b': '0' },
                id: that.data.act_id
            },
            success: function (resdata) {

                wx.setStorageSync('code_src_img', resdata.data.data);

                console.log(resdata.data.data);

                wx.navigateTo({
                    url: '/pages/activity/share_success/index?id=' + that.data.act_id
                });

                wx.downloadFile({
                    url: resdata.data.data,
                    success: function (down_res) {
                        wx.setStorageSync('code_src', down_res.tempFilePath);
                       
                        that.setData({

                            share_status: false

                        });
                    }
                });

                that.setData({
                    // app_code: true,
                    code_src: resdata.data.data
                });
            },
            fail: function () {
                wx.showToast({
                    title: '二维码获取失败',
                    icon: 'loading',
                    duration: 1000
                });
            }
        });
    },
    share_btn:function(e){

        var that=this;

        that.setData({

            share_status: false

        });
    },
    onPullDownRefresh: function (e) {
        wx.stopPullDownRefresh();
        this.get_act_inf();
    },
    onShareAppMessage: function (e) {
        app.aldstat.sendEvent('分享');
        var that = this;
        that.setData({
            share_status: false
        });
        return {
            title: that.data.act_data.title,
            path: '/pages/activity/details/index?id=' + that.data.act_id,
            success: function (res) {

                // that.setData({

                //     share_status: false

                // });
                // wx.request({
                //     url: app.globalData.url + 'index.php?g=&m=api&a=get_wx_acode',
                //     data: {
                //         page: '/pages/activity/details/index?id=' + that.data.act_id,
                //         width: 430,
                //         auto_color: false,
                //         line_color: { 'r': '0', 'g': '0', 'b': '0' },
                //         id: that.data.act_id
                //     },
                //     success: function (resdata) {
                        
                //         wx.downloadFile({
                //             url: resdata.data.data,
                //             success: function (down_res) {
                //                 wx.setStorageSync('code_src', down_res.tempFilePath);
                //                 wx.navigateTo({
                //                     url: '/pages/activity/share_success/index?id=' + that.data.act_id
                //                 });

                //             }
                //         });
                        
                //         that.setData({
                //             // app_code: true,
                //             code_src: resdata.data.data
                //         });
                //     },
                //     fail:function(){
                //         wx.showToast({
                //             title: '二维码获取失败',
                //             icon:'loading',
                //             duration:1000
                //         });
                //     }
                // })
            }
        }
    }
});