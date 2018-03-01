
var app = getApp();
const ctx = wx.createCanvasContext('myCanvas');

Page({

    data: {
        img_src: null,
        src: null
    },
    onLoad: function (option) {

        var that = this;

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_details_api',
            data: {
                user_openid: wx.getStorageSync('openid'),
                id: option.id
            },
            success: function (res) {

                if (res.data.status == 1) {

                    wx.downloadFile({
                        url: res.data.data.cover,
                        success: function (sres) {

                            ctx.setFillStyle('black');
                            ctx.setFontSize(20)
                            ctx.setTextAlign('left');
                            ctx.fillText(res.data.data.founder_user_nickname, 96, 35);
                            ctx.setTextAlign('left');
                            ctx.fillText('发布一个组织活动', 96, 65);
                            ctx.setTextAlign('left');
                            ctx.fillText(res.data.data.title, 15, 110);

                            ctx.setTextAlign('center');

                            ctx.fillText('长按识别小程序 参与活动', 200, 420);

                            ctx.drawImage(wx.getStorageSync('code_src'), 150, 310, 70, 70);

                            ctx.drawImage(sres.tempFilePath, 5, 130, 364, 155);

                            ctx.save();

                        }, fail: function (fres) {

                        }
                    });

                    setTimeout(function(){

                        wx.downloadFile({
                            url: res.data.data.founder_user_img,
                            success: function (sres) {

                                ctx.beginPath()
                                ctx.arc(50, 50, 25, 0, 2 * Math.PI)
                                ctx.clip()
                                ctx.drawImage(sres.tempFilePath, 25, 25, 50, 50);

                            }, fail: function (fres) {

                            }
                        });

                    },300);


                    setTimeout(function () {
                        ctx.draw(true, function (res) {
                            wx.canvasToTempFilePath({
                                x: 0,
                                y: 0,
                                canvasId: 'myCanvas',
                                fileType: 'jpg',
                                quality: 1,
                                success: function (res) {
                                    console.log(res.tempFilePath);

                                    that.setData({

                                        img_src: res.tempFilePath

                                    });
                                }
                            })
                        });

                    }, 1000);

                    ctx.rect(0, 0, 375, 900)
                    ctx.setFillStyle('white')
                    ctx.fill();
                    ctx.save();
                    ctx.draw(true);

                }
            }
        });
    },
    save_img: function (e) {

        var that = this;
        wx.saveImageToPhotosAlbum({
            filePath: that.data.img_src,
            complete: function (res) {
                console.log(res);
            }
        })
    }


});