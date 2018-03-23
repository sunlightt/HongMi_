
var app = getApp();
const ctx = wx.createCanvasContext('myCanvas');

app.aldstat.sendEvent('活动大厅');

Page({

    data: {
        img_src: null,
        src: null,
        width: 0,

        // 是否为ios,
        model: null
    },
    onLoad: function (option) {

        var that = this;

        var context = ctx;

        wx.getSystemInfo({
            success: function (res) {

                console.log(res.model);

                var model = res.model.indexOf('iPhone ') == -1 ? false : true;

                console.log(model);

                that.setData({

                    width: res.windowWidth,
                    model: model

                });
            },
        });

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_details_api',
            data: {
                user_openid: wx.getStorageSync('openid'),
                id: option.id
            },
            success: function (res) {

                if (res.data.status == 1) {

                    that.setData({

                        cover: res.data.data.cover,
                        founder_user_img: res.data.data.founder_user_img,
                        code_src_img: wx.getStorageSync('code_src_img'),
                        founder_user_nickname: res.data.data.founder_user_nickname,
                        title: res.data.data.title,
                        slogan: res.data.data.slogan

                    });

                    // that.setBg(context);

                    that.setHandle(context);

                    // that.setTitle(context);

                    // wx.showToast({
                    //     title: '加载中',
                    //     icon:'loading'
                    // });

                    wx.showLoading({
                        title: '加载中',
                    });

                }
            }
        });

    },
    setBg: function (context) {

        var that = this;

        var qrcodeUrl = that.data.cover;

        var width = 290;
        var height = 155;

        var set_height = height + (that.data.width - 290);

        wx.getImageInfo({

            src: qrcodeUrl,

            success: function (res) {

                // context.save();
                // context.beginPath();
                // context.rect(0, -5, that.data.width, 910);
                // context.setFillStyle('white');
                // // context.setFillStyle('red');
                // context.closePath();
                // context.fill();
                // context.restore();

                var path = res.path;

                context.save();

                // context.beginPath();

                // context.drawImage(path, 15, 156, (that.data.width - 30), 170);

                context.drawImage(path, 15, 156, 290, 170);

                // context.closePath();

                // context.restore();

                // that.setQrcode(context);

                setTimeout(function () {

                    context.draw(true, function () {

                        that.setQrcode(context);

                    });

                }, 200);

                // that.setTip(context);

                // that.setTitle(context);

                // that.setMsg(context);

                // that.setslogan(context);

            },

            file: function (res) {

                console.log(res);

            }
        })
    },
    setTitle: function (context) {

        var that = this;

        // context.save();
        // context.beginPath();
        // context.rect(0, -5, that.data.width, 910);
        // context.setFillStyle('white');
        // // context.setFillStyle('red');
        // context.closePath();
        // context.fill();
        // context.restore();

        var title = this.data.founder_user_nickname;

        context.save();

        // context.beginPath();

        context.setFontSize(18);

        context.setTextAlign('left');

        context.setTextBaseline('top');

        context.setFillStyle('#2A2A2A');

        // context.fillText(title, 96, 17);

        context.fillText(title, 96, 19);

        // context.closePath();

        // context.restore();

        setTimeout(function () {

            context.draw(true, function () {

                that.setMsg(context);

            });

        }, 200);

    },
    setMsg: function (context) {

        var that = this;

        context.save();

        // context.beginPath();

        context.setFontSize(16);

        context.setTextAlign('left');

        context.setTextBaseline('bottom');

        context.setFillStyle('#2A2A2A');

        // context.fillText('发布了一个组织活动：', 85, 79);

        context.fillText('发布了一个组队活动', 96, 77);

        // context.closePath();

        // context.restore();

        setTimeout(function () {

            context.draw(true, function () {

                that.setTitles(context);

            });

        }, 200);


    },
    setTitles: function (context) {

        var that = this;
        var title = this.data.title;

        context.save();

        // context.beginPath();

        context.setFontSize(20);

        context.setTextAlign('left');

        context.setTextBaseline('top');

        context.setFillStyle('#2A2A2A');

        // context.fillText(title, 15, 96);

        context.fillText(title, 15, 93);

        // context.closePath();

        // context.restore();

        setTimeout(function () {

            context.draw(true, function () {

                that.setslogan(context);

            });

        }, 200);
    },
    setTip: function (context) {

        var that = this;

        context.save();

        // context.beginPath();

        context.setFontSize(12);

        context.setTextAlign('center');

        context.setTextBaseline('top');

        context.setFillStyle('#000000');

        context.fillText('长按扫码 参加活动', 160, 426);

        // context.closePath();

        // context.restore();

        setTimeout(function () {

            context.draw(true, function () {

                // that.setHandle(context);

                setTimeout(function(){
                    
                    wx.hideLoading();

                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        canvasId: 'myCanvas',
                        fileType: 'png',
                        quality: 1,
                        success: function (res) {

                            that.setData({

                                img_src: res.tempFilePath

                            });
                        }
                    });

                },300);


            });

        }, 200);
    },
    setslogan: function (context) {

        var that = this;

        var title = this.data.slogan;

        context.save();

        // context.beginPath();

        context.setFontSize(18);

        context.setTextAlign('left');

        context.setTextBaseline('top');

        context.setTextBaseline('#2A2A2A');

        context.setFillStyle('#000000');

        if (that.data.model) {

            context.fillText(title, 15, 142);

        } else {

            context.fillText(title, 15, 126);

        }

        // context.closePath();

        // context.restore();

        setTimeout(function () {

            context.draw(true, function () {

                that.setBg(context);

            });

        }, 200);

    },
    setQrcode: function (context) {

        var that = this;

        var HandleUrl = this.data.code_src_img;

        console.log(HandleUrl);

        wx.getImageInfo({

            src: HandleUrl,

            success: function (res) {

                var path = res.path;

                context.save();

                // context.beginPath();

                // context.drawImage(path, ((that.data.width / 2) - 35), 341, 70, 70);

                // context.drawImage(path, ((320 / 2) - 35), 341, 70, 70);

                context.drawImage(path, 125, 341, 70, 70);


                // context.closePath();

                // context.restore();

                context.draw(true, function () {

                    that.setTip(context);

                });

                // setTimeout(function(){

                //     context.draw(true, function () {

                //         that.setHandle(context);

                //     });

                // },5000);

            },

            file: function (res) {

                console.log(res);

            }

        })

    },
    setHandle: function (context) {

        var that = this;

        var path = that.data.founder_user_img

        wx.getImageInfo({

            src: path,

            success: function (res) {

                context.save();
                context.beginPath();
                context.rect(0, -5, that.data.width, 910);
                context.setFillStyle('white');
                // context.setFillStyle('red');
                context.closePath();
                context.fill();
                context.restore();

                var path = res.path;

                context.save();
                context.beginPath();

                // context.arc(48, 48, 33, 0, 2 * Math.PI)

                context.arc(48, 48, 28, 0, 2 * Math.PI)
                context.fill();
                context.clip()
                context.drawImage(path, 20, 20, 56, 56);

                context.closePath();

                context.restore();

                context.draw(true, function (e) {

                    // wx.hideLoading();

                    that.setTitle(context);

                    // wx.canvasToTempFilePath({
                    //     x: 0,
                    //     y: 0,
                    //     canvasId: 'myCanvas',
                    //     fileType: 'png',
                    //     quality: 1,
                    //     success: function (res) {

                    //         that.setData({

                    //             img_src: res.tempFilePath

                    //         });
                    //     }
                    // });

                })

            },

            file: function (res) {

                console.log(res);

            }

        });

    },

    save_img: function (e) {

        var that = this;
        wx.saveImageToPhotosAlbum({
            filePath: that.data.img_src,
            success: function (res) {

                wx.showToast({
                    title: '保存成功',
                    icon: 'loading',
                    duration: 1000
                });
            }
        })
    }

});