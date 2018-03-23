//app.js

var aldstat = require("/utils/ald-stat.js");

var QQMapWX = require('/utils/qqmap-wx-jssdk.min.js');

App({
    onLaunch: function () {

        var that = this;

        that.globalData.qqmapsdk = new QQMapWX({
            key: 'WV4BZ-ZZNC4-TFDUS-XW5XV-D5WHZ-Z3FWX'
        }); 
        // 登录
        wx.login({
            success: function (res) {
                if (res.code) {
                    wx.request({
                        //获取openid接口  
                        url: that.globalData.url + 'index.php?g=&m=api&a=get_openid_api',
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            code: res.code
                        },
                        method: 'GET',
                        success: function (response) {
                            if (response.data.status == 1) {
                                that.globalData.openid = response.data.data.openid;
                                wx.setStorageSync('openid', response.data.data.openid);
                                if (response.data.data.is_register == 2) {
                                    wx.getUserInfo({
                                        success: function (respon) {
                                            that.globalData.userInfo = respon.userInfo;
                                            wx.request({
                                                url: that.globalData.url +'index.php?g=&m=api&a=register_api',
                                                type:'POST',
                                                data:{
                                                    openid: response.data.data.openid,
                                                    nickname: respon.userInfo.nickName,
                                                    sex: respon.userInfo.gender,
                                                    head_img: respon.userInfo.avatarUrl,
                                                    unionid: response.data.data.unionid
                                                },
                                                success:function(resdata){
                                                    console.log(resdata);
                                                }
                                            })
                                        }
                                    })

                                }

                            }else{
                                // wx.getUserInfo({
                                //     success:function(res){

                                //          console.log(res);

                                //     }
                                // })
								return;
                            }
                        }
                    })

                } else {
                    console.log('获取用户登录态失败！' + res.errMsg);
                }

            }
        });

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo;

                            console.log(res.userInfo);

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    globalData: {
        qqmapsdk: null,
        url: 'https://xcx.homieztech.com/',
        userInfo:null,
        openid:null,
        location:null
    }
})