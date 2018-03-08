
const app = getApp();
const dateTimePicker = require('../../../utils/dateTimePicker.js');

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
                console.log(res);
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
        change_type: 1,
        act_inf:null,

        showToast: false,
        toast_msg: '信息有误'

    },
    onLoad: function (option) {

        var that=this;

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
            dateTime2: obj2.dateTime,
            act_id:option.id
            
        });

        that.get_actinf();

    },
    get_actinf:function(e){
     
        var that=this;
        wx.request({
            url: app.globalData.url +'index.php?g=&m=api&a=activity_change_details_api',
            data:{
                user_openid: wx.getStorageSync('openid'),
                id: that.data.act_id
            },
            success:function(res){
               
                console.log(res);

                if (res.data.status==1){

                    var start_date = res.data.data.start_time;
                    var start_date_str = start_date.split(' ');
                    var start_date_arr = start_date_str[0].split('-').concat(start_date_str[1].split(':'));
                    start_date_arr.splice(start_date_arr.length-2,2);
                    start_date_arr[0] = Number(start_date_arr[0].slice(2, 4));
                    start_date_arr[1] = Number(start_date_arr[1])-1;
                    start_date_arr[2] = Number(start_date_arr[2])-1;
                    start_date_arr[3] = Number(start_date_arr[3]);
                      
                    var end_date = res.data.data.end_time;
                    var end_date_str = end_date.split(' ');
                    var end_date_arr = end_date_str[0].split('-').concat(end_date_str[1].split(':'));
                    end_date_arr.splice(end_date_arr.length - 2, 2);
                    end_date_arr[0] = Number(end_date_arr[0].slice(2, 4));
                    end_date_arr[1] = Number(end_date_arr[1])-1;
                    end_date_arr[2] = Number(end_date_arr[2])-1;
                    end_date_arr[3] = Number(end_date_arr[3]);

                    that.setData({

                        poster_src: res.data.data.cover,
                        act_inf: res.data.data,
                        dateTime1: start_date_arr,
                        dateTime2: end_date_arr
                        
                    });
                }
            }
        });

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
    change_type: function (e) {

        

        this.setData({
            change_type: e.currentTarget.dataset.index
        });
    },
    formsbumit: function (e) {

        var that = this;

        var date = new Date();

        var timestamp = parseInt(Date.parse(new Date()) / 1000);

        var now_hours = date.getHours();
        
        var title = e.detail.value.title;
        var people_num = e.detail.value.num;
        // 活动id  暂时定值
        var id = that.data.act_id;

        var month1 = withData(Number(that.data.dateTime1[1]) + 1);
        var day1 = withData(Number(that.data.dateTime1[2]) + 1);
        var hour1 = withData(that.data.dateTime1[3]);

        var month2 = withData(Number(that.data.dateTime2[1]) + 1);
        var day2 = withData(Number(that.data.dateTime2[2]) + 1);
        var hour2 = withData(that.data.dateTime2[3]);

        var dec = e.detail.value.act_msg;
        var lng = app.globalData.location.longitude;
        var lat = app.globalData.location.latitude;
        var cover = that.data.poster_src;
        var slogan = e.detail.value.slogan;

        var form_id = e.detail.formId;


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
        if (that.data.change_type == 1) {

            app.aldstat.sendEvent('确认变更');
            send_data = {
                id: id,
                user_openid: wx.getStorageSync('openid'),
                title: title,
                people_num: people_num,
                start_time: start_time,
                end_time: end_time,
                dec: dec,
                lng: lng,
                lat: lat,
                cover: cover,
                slogan: slogan,
                type: that.data.change_type
            };

        }else{
            app.aldstat.sendEvent('关闭活动');
            send_data = {
                user_openid: wx.getStorageSync('openid'),
                id: id,
                type: that.data.change_type
            };
        }

        // if (title == '' || people_num == '' || dec == '') {

        //     wx.showToast({
        //         title: '信息不完善',
        //         icon: 'loading',
        //         duration: 1000
        //     });
        //     return;

        // }else if (Number(get_unix_time(start_time)) >= Number(get_unix_time(end_time))) {

        //     wx.showToast({
        //         title: '活动结束时间设置有误',
        //         icon: 'loading',
        //         duration: 1000
        //     });

        //     return;
        // }


        if (title == '' || dec == '') {

            wx.showToast({
                title: '发布信息不完善',
                icon: 'loading',
                duration: 1000
            });
            return;

        }

        if (Number(get_unix_time(start_time)) >= Number(get_unix_time(end_time)) && that.data.change_type == 1) {

            that.setData({
                toast_msg: '截止时间必须大于开始时间',
                showToast: true
            });

            setTimeout(function () {

                that.setData({
                    showToast: false
                });

            }, 1200);

            return;
        } else if (Number(get_unix_time(start_time)) <= timestamp && hour1 != now_hours && that.data.change_type == 1) {

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

        wx.showModal({
            title: '变更提醒',
            content: '确定要变更活动吗？',
            success:function(res){
                if (res.confirm){
                    wx.request({
                        url: app.globalData.url + 'index.php?g=&m=api&a=activity_change_api',
                        method: 'GET',
                        data: send_data,
                        success: function (res) {
                            if (res.data.status == 1) {
                                var text = null;
                                if (that.data.change_type == 1) {

                                    text = '变更成功';

                                } else {

                                    text = '关闭成功';

                                }
                                wx.showToast({
                                    title: text,
                                    icon: 'loading',
                                    duration: 1000
                                });
                                wx.setStorageSync('act_change', true);
                                wx.reLaunch({
                                    url: '/pages/person/index'
                                });
                                // 发送模板消息
                                var send_time = '20' + that.data.dateTime1[0] + '-' + month1 + '-' + day1 + ' ' + hour1 + '/' + '20' + that.data.dateTime2[0] + '-' + month2 + '-' + day2 + ' ' + hour2;
                                var data_str = JSON.stringify([title, send_time, ' ']);
                                wx.request({
                                    url: app.globalData.url + 'index.php?g=&m=api&a=send_wx_mod_api',
                                    method: 'GET',
                                    data: {
                                        id: id,
                                        template_id: '5ScRcmpn9R2dvqUaOe4MxD8nT-fX-IjhsE7m-eHGKcc',
                                        page: '/pages/activity/details/index?id=' + id,
                                        form_id: form_id,
                                        data: { title: title, time: send_time }
                                    },
                                    success: function (res) {

                                        console.log(res);

                                    }
                                });
                            } else {
                                var text = null;
                                if (that.data.change_type == 1) {

                                    text = '变更失败';

                                } else {

                                    text = '关闭失败';

                                }
                                wx.showToast({
                                    title: text,
                                    icon: 'loading',
                                    duration: 1000
                                });

                            }
                        }
                    });

                }
            }

        });

        return;
    },
    onPullDownRefresh:function(e){

        wx.stopPullDownRefresh();
        this.get_actinf();
    }
})