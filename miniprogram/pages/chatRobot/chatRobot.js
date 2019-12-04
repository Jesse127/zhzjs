// pages/chatRobot/chatRobot.js
var that;
var pub = require('../../temple/js/function.js');//引用公共js模块
//锁模块 用于控制录音键
var lock = false, lock_end = 0;
//定时器全局
var lock_timer = ""
//音频文件存储
var list, fileId;
//临时存储声音base64
var sound_json = "[]";
sound_json = JSON.parse(sound_json);
//腾讯语音合成模块
function speak(text) {
  wx.cloud.callFunction({
    name: "TextToVoice",
    data: {
      //传参给云函数
      "text": text,
      "speed": 0,
    },
    success: (res) => {
      var result = res.result;
      //临时存储音频base64 减少接口请求次数
      var arr = { "base64": result.Audio, }
      sound_json.push(arr);
      //播放声音
      pub.play_sound(result.Audio, that);
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "语音合成失败", 0);
    },
    complete: () => {
      pub.show_tip(3, 0, 0, 0);
    }
  })
}
//腾讯智能对话模块
function ask_voice(text) {
  wx.cloud.callFunction({
    name: "TextProcess",
    data: {
      //传参给云函数
      "text": text
    },
    success: (res) => {
      console.log("互动返回:", res.result.ResponseText);
      pub.show_tip(2, "none", "等待返回", 0);
      //转换为语音信息
      speak(res.result.ResponseText);
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "闲聊机器人异常", 0);
    }
  })
}
//语音识别模块
function get_void_text(url) {
  wx.cloud.callFunction({
    name: "VoiceToText",
    data: {
      //传参给云函数
      "url": url
    },
    success: (res) => {
      pub.show_tip(2, "none", "正在处理中", 0);
      if (res.result.Result == "") {
        console.log(res);
        pub.show_tip(0, "none", "语音识别失败", 0);
      }
      else {
        console.log("语音识别结果", res.result.Result);
        //发起云对话
        pub.del_file(fileId);
        ask_voice(res.result.Result);
      }
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "语音识别失败", 0);
    },
  })
}
//上传录音到云存储
function uploadvoice(filePath) {
  fileId = "";
  // 上传音频文件
  const cloudPath = pub.guid() + ".mp3"
  wx.cloud.uploadFile({
    cloudPath,
    filePath,
    success: res => {
      fileId = res.fileID;
      //转换成临时下载链接
      wx.cloud.getTempFileURL({
        fileList: [res.fileID],
        success: res => {
          //发起语音识别
          get_void_text(res.fileList[0].tempFileURL);
        },
        fail: res => {
          pub.show_tip(0, "none", "解析音频出错", 0);
        },
      })
    },
    fail: e => {
      pub.show_tip(0, "none", "上传音频出错", 0);
    }
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    width: 0,
    lubutn: "按住 说话",
  },
  /**
   * 按住触发事件
   */
  touchStart: function (e) {
    lock_end = 0;
    if (lock == false)
      lock = true;
    else
      return;
    var start = e.timeStamp;
    var seconds = (start % (1000 * 60)) / 1000;
    this.recorderManager.start({
      format: 'mp3'
    });
    this.setData({
      lubutn: "松开 停止",
      start: seconds,
      lubtncl: "background: #e2e2e2 !important;"
    })
    pub.show_tip(1, "none", "正在录音中", 600000);
  },

  // 松开触发事件
  touchEnd: function (e) {
    lock_end = 0;
    //这里使用定时器的方法 防止快速点击产生的bug
    if (lock_timer != "")
      clearTimeout(lock_timer)
    lock_timer = setTimeout(() => {
      pub.show_tip(3, 0, 0, 0);
      if (lock == true) {
        var start = this.data.start;
        var end = e.timeStamp;
        var seconds = (end % (1000 * 60)) / 1000;
        var shijian = seconds - start;
        var width = shijian * 4;
        this.setData({
          lubutn: "按住 说话",
          end: seconds,
          shijian: shijian,
          width: width
        })
        this.recorderManager.stop();
      }
      lock = false;
    }, 400);
  },

  //触摸被打断事件
  touchcancel: function (e) {
    lock_end = 1;
    pub.show_tip(0, "none", "录音被打断", 0);
    lock = false;
    //取消已存在的定时器
    if (lock_timer != "")
      clearTimeout(lock_timer);
    lock_timer = setTimeout(() => {
      this.recorderManager.stop();
      this.setData({
        lubutn: "按住 说话",
      })
    }, 400);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    that = this;
    //  初始化录音对象
    this.recorderManager = wx.getRecorderManager();
    // 录音结束
    this.recorderManager.onStop(function (res) {
      if (lock_end == 0) {
        list = that.data.list;
        var width = that.data.width;
        var shijian = that.data.shijian;
        var src = res.tempFilePath;
        if (src == "") {
          pub.show_tip(0, "none", "录音失败,请重试", 0);
        }
        else {
          //判断录音时间长短
          if (shijian < 1) {
            pub.show_tip(1, "none", "录音时间过短", 2000);
          }
          else {
            var aa = {
              src: src,
              width: width,
              play: false,
              shijian: parseInt(shijian),
              type: true,//自己发出的消息
            }
            list.push(aa);
            that.setData({
              list: list
            })
            pub.show_tip(2, "none", "正在识别", 0);
            //录音完成上传语音文件
            uploadvoice(res.tempFilePath);
          }
        }
      }
    });

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      pub.show_tip(0, "none", "播放录音失败", 0);
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 播放录音
   */
  // 播放录音
  audioPlay: function (e) {
    var that = this;
    var src = e.currentTarget.dataset.src;
    if (src == '') {
      pub.show_tip(0, "none", "语音已过期", 0);
      return;
    }
    this.innerAudioContext.src = src;
    this.innerAudioContext.play();
  },
})