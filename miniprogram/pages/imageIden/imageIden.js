// pages/imageIden/imageIden.js
var pub = require('../../temple/js/function.js');//引用公共js模块
//全局图片变量
var fileId, cloudPath, filePath, downLoadPath;
var tag_list, fanyi_tag_list, that;
//临时存储声音base64
var sound_json = "[]";
sound_json = JSON.parse(sound_json);
//朗读功能
function sound_start(id, text) {
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
      var arr = { "id": String(id), "base64": result.Audio, }
      sound_json.push(arr);
      pub.play_sound(result.Audio);
    },
    fail(err) {
      console.log(err);
      pub.show_tip(0, "none", "朗读出现错误", 0);
    }
  })
}
//翻译完毕展示数据
function show() {
  //将字符串转换成数组
  tag_list = tag_list.split("！");
  fanyi_tag_list = fanyi_tag_list.split("!");
  that.setData({
    "tag_list": tag_list,
    "fanyi_tag_list": fanyi_tag_list,
    'show_tag': '',
  });
  pub.show_tip(3, 0, 0, 0);
}
//腾讯云翻译模块
function fanyi() {
  //翻译前准备 组合数组
  var ls = "";
  for (var i = 0; i < tag_list.length; i++) {
    //剔除重复出现的内容
    if (ls.indexOf(tag_list[i].Name) == -1) {
      ls = ls + tag_list[i].Name + "！";
    }
  }
  tag_list = ls.substr(0, ls.length - 1);
  wx.cloud.callFunction({
    name: "TextToEng",
    data: {
      //传参给云函数
      "text": tag_list
    },
    success: (res) => {
      var result = res.result;
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      fanyi_tag_list = result.TargetText;
      show();
    },
    fail(err) {
      console.log(err);
      pub.show_tip(0, "none", "翻译处理出错", 0);
    }
  })
}
//腾讯云图片识别SDK
function scanImg() {
  //调用腾讯云函数进行识别
  wx.cloud.callFunction({
    name: "scan_img",
    data: {
      //传参给云函数
      "imgBase64": downLoadPath
    },
    success: (res) => {
      tag_list = res.result.Labels;
      pub.del_file(fileId);
      pub.show_tip(2, "none", "图片翻译中", 0);
      fanyi();//开始进行翻译
    },
    fail(err) {
      console.log(err);
      pub.show_tip(0, "none", "识别图片出错", 0);
    }
  })
}
//云存储获取临时下载地址
function download() {
  wx.cloud.getTempFileURL({
    fileList: [fileId],
    success: res => {
      //临时存储下载地址
      downLoadPath = res.fileList[0].tempFileURL;
      //开始图片识别
      scanImg();
    },
    fail: res => {
      console.log(res);
      pub.show_tip(0, "none", "处理图片异常", 0);
    },
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "tag_list": null,
    "fanyi_tag_list": null,
    'show_tag': 'display:none',
  },
  /**
   * 中英文朗读
   */
  sound: function (e) {
    let query = e.currentTarget.dataset['index'];
    let id = e.currentTarget.dataset['id'];
    //判断音频文件是否已缓存
    if (sound_json.length == 0) {
      console.log("该音频没有缓存,开始请求api");
      sound_start(id, query);
    }
    else {
      var s = 0;
      for (var k = 0; k < sound_json.length; k++) {
        if (sound_json[k].id == String(id)) {
          console.log("该音频已缓存 开始播放")
          pub.play_sound(sound_json[k].base64);
          s = 1;
        }
      }
      if (s == 0) {
        console.log("该音频没有缓存,开始请求api")
        sound_start(id, query);
      }
    }
  },
  /**
   * 上传图片
   */
  doUpload: function (e) {
    //清空临时变量
    fileId = "", cloudPath = "", filePath = "", downLoadPath = "";
    tag_list = "", fanyi_tag_list = "";
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],//图片压缩类型
      sourceType: ['album', 'camera'],//允许类型 本地照片 即时拍摄
      success: function (res) {
        //文件路径
        filePath = res.tempFilePaths[0];
        //文件编号
        cloudPath = pub.guid() + filePath.match(/\.[^.]+?$/)[0];
        pub.show_tip(2, "none", "图片上传中", 0);
        //上传文件到云存储
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            sound_json = "[]";
            sound_json = JSON.parse(sound_json);
            //存储临时变量
            fileId = res.fileID;
            pub.show_tip(2, "none", "图片解析中", 0);
            //获取下载地址
            download();
          },
          fail: e => {
            console.log(res);
            pub.show_tip(0, "none", "图片上传失败", 0);
          }
        })
      },
      fail: function (res) {
        console.log(res);
        pub.show_tip(0, "none", "选择图片异常", 0);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})