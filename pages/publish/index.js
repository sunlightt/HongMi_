
const app = getApp();
const dateTimePicker = require('../../utils/dateTimePicker.js');

var poster_src = null;

function withData(param) {
    return param < 10 ? '0' + param : '' + param;
}

function get_unix_time(dateStr) {
    var newstr = dateStr.replace(/-/g, '/');
    var date = new Date(newstr);
    var time_str = date.getTime().toString();
    return time_str.substr(0, 10);
}

function upload(page, path) {
    wx.showToast({
        icon: "loading",
        title: "正在上传"
    }),
        wx.uploadFile({
            url: app.globalData.url + 'index.php?g=&m=api&a=cover_upload_api',
            filePath: path[0],
            name: 'file',
            success: function (res) {
                if (res.statusCode != 200) {
                    wx.showModal({
                        title: '提示',
                        content: '上传失败',
                        showCancel: false
                    })
                    return;
                }
                var res_data = JSON.parse(res.data);
                poster_src = res_data.data;

                page.setData({
                    poster_src: res_data.data
                });
            },
            fail: function (e) {
                console.log(e);
                wx.showModal({
                    title: '提示',
                    content: '上传失败',
                    showCancel: false
                })
            },
            complete: function () {
                wx.hideToast();  //隐藏Toast
            }
        });
}

Page({

    data: {
        date: '2018-10-01',
        time: '12:00',
        dateTimeArray1: null,
        dateTime1: null,
        dateTimeArray2: null,
        dateTime2: null,
        startYear: 2000,
        endYear: 2050,
        poster_src: '/img/pro_img.png',
        
        showToast:false,
        toast_msg:'信息有误'
    },
    onLoad: function () {

        // 获取完整的年月日 时分秒，以及默认显示的数组
        var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        var obj2 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        // 精确到分的处理，将数组的秒去掉
        var lastArray = obj1.dateTimeArray.splice(obj1.dateTime.length - 2, 2);
        var lastTime = obj1.dateTime.splice(obj1.dateTime.length - 2, 2);

        var lastArray1 = obj2.dateTimeArray.splice(obj2.dateTime.length - 2, 2);
        var lastTime1 = obj2.dateTime.splice(obj2.dateTime.length - 2, 2);

        this.setData({
            dateTimeArray1: obj1.dateTimeArray,
            dateTime1: obj1.dateTime,
            dateTimeArray2: obj2.dateTimeArray,
        
            dateTime2: obj2.dateTime
        });

    },
    onShow:function(res){

        app.aldstat.sendEvent('发布');

    },
    publish: function () {

    },
    changeDateTime1(e) {
        this.setData({ dateTime1: e.detail.value });
    },
    changeDateTime2(e) {
        this.setData({ dateTime2: e.detail.value });
    },
    changeDateTimeColumn1(e) {
        var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
        arr[e.detail.column] = e.detail.value;
        dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

        this.setData({
            dateTimeArray1: dateArr,
            dateTime1: arr
        });

    },
    changeDateTimeColumn2(e) {
        var arr = this.data.dateTime2, dateArr = this.data.dateTimeArray2;
        arr[e.detail.column] = e.detail.value;
        dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
        this.setData({
            dateTimeArray2: dateArr,
            dateTime2: arr
        });
    },

    add_poster: function () {

        app.aldstat.sendEvent('添加封面');
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePaths = res.tempFilePaths;
                upload(that, tempFilePaths);
            }
        })
    },
    formsbumit: function (e) {
        
        var that = this;

        var date=new Date();

        var timestamp = parseInt(Date.parse(new Date())/1000);

        var now_hours = date.getHours();

        var title = e.detail.value.title;
        var people_num = e.detail.value.num;

        var month1 = withData(Number(that.data.dateTime1[1]) + 1);
        var day1 = withData(Number(that.data.dateTime1[2]) + 1);
        var hour1 = withData(that.data.dateTime1[3]);

        var month2 = withData(Number(that.data.dateTime2[1]) + 1);
        var day2 = withData(Number(that.data.dateTime2[2]) + 1);
        var hour2 = withData(that.data.dateTime2[3]);
        

        var dec = e.detail.value.act_msg;
        var lng = app.globalData.location.longitude;
        var lat = app.globalData.location.latitude;
        var cover = poster_src;
        var slogan = e.detail.value.slogan;

        var start_time = '20' + that.data.dateTime1[0] + '-' + month1 + '-' + day1 + ' ' + hour1 + ':' + '00' + ':' + '00';

        var end_time = '20' + that.data.dateTime2[0] + '-' + month2 + '-' + day2 + ' ' + hour2 + ':' + '00' + ':' + '00';

        var send_data = {
            user_openid: wx.getStorageSync('openid'),
            title: title,
            people_num: people_num,
            start_time: start_time,
            end_time: end_time,
            dec: dec,
            lng: lng,
            lat: lat,
            cover: cover,
            slogan: slogan
        };

        if (title == '' || dec == '') {

            wx.showToast({
                title: '发布信息不完善',
                icon: 'loading',
                duration: 1000
            });
            return;

        }
        if (!poster_src) {

            delete send_data['cover'];

        }
        if (slogan == '') {
            
            delete send_data['slogan'];

        }
        if (people_num==''){

            send_data.people_num=4;

		} else if (people_num<2){

			wx.showToast({
				title: '人数不应少于2人',
				image: '/img/tip.png',
				duration: 1200
			});

			return;

		} 
        
       if (Number(get_unix_time(start_time)) >= Number(get_unix_time(end_time))){

            that.setData({
                toast_msg:'截止时间必须大于开始时间',
                showToast:true
            });

            setTimeout(function(){

                that.setData({
                    showToast: false
                });

            },1200);
            
            return;
       } else if (Number(get_unix_time(start_time)) <= timestamp && hour1 != now_hours){
           
            that.setData({
                toast_msg: '开始时间不应小于当前时间',
                showToast: true
            });

            setTimeout(function () {

                that.setData({
                    showToast: false
                });

            }, 1200);

            return;

        }

        wx.request({
            url: app.globalData.url + 'index.php?g=&m=api&a=activity_publish_api',
            method: 'GET',
            data: send_data,
            success: function (res) {
                if (res.data.status == 1) {

                    app.aldstat.sendEvent('确认发布');

                    wx.showToast({
                        title: '发布成功',
                        icon: 'loading',
                        duration: 1000
                    });
                    setTimeout(function () {
                        wx.navigateTo({
                            url: '/pages/publish/publish_success/index?entry=publish_success&id=' + res.data.data.id + '&invi_openid=' + wx.getStorageSync('openid')
                        });
                    }, 1000);

                } else {
                    var text=null;

                    that.setData({
                        toast_msg: res.data.message,
                        showToast: true
                    });

                    setTimeout(function () {

                        that.setData({
                            showToast: false
                        });

                    }, 1500);

                }
            }
        });
    },
    member_num:function(e){
        var value = e.detail.value;
        if (value<2){
            wx.showToast({
                title: '人数不应少于2人',
                image:'/img/tip.png',
                duration:1200
            });
        }
    },
    onPullDownRefresh:function(e){
        
        wx.stopPullDownRefresh();
        
        // 获取完整的年月日 时分秒，以及默认显示的数组
        var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        var obj2 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        // 精确到分的处理，将数组的秒去掉
        var lastArray = obj1.dateTimeArray.splice(obj1.dateTime.length - 2, 2);
        var lastTime = obj1.dateTime.splice(obj1.dateTime.length - 2, 2);

        var lastArray1 = obj2.dateTimeArray.splice(obj2.dateTime.length - 2, 2);
        var lastTime1 = obj2.dateTime.splice(obj2.dateTime.length - 2, 2);

        this.setData({
            dateTimeArray1: obj1.dateTimeArray,
            dateTime1: obj1.dateTime,
            dateTimeArray2: obj2.dateTimeArray,
            dateTime2: obj2.dateTime
        });
        
    },
    onPageScroll:function(){

    },
    onTabItemTap:function(item) {
        console.log(item);
    }
})