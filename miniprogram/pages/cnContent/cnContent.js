// pages/cnContent/cnContent.js
var pub = require('../../temple/js/function.js');//引用公共js模块
// 创建数据库实例
var that;
const db = wx.cloud.database();
//临时存储数据库结果集
var db_result = "";
//音频文件存储
var list, list2 = "";
//置随机数种子
var num = Math.random();
//播放答案
function read_da() {
  list2 = "";
  wx.cloud.callFunction({
    name: "TextToVoice",
    data: {
      //传参给云函数
      "text": that.data.all_text,
      "speed": 0,
    },
    success: (res) => {
      pub.show_tip(3, 0, 0, 0);
      var result = res.result;
      console.log(result);
      list2 = result.Audio;
      //播放声音
      pub.play_sound(list2,that,1);
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "朗读失败", 0);
    }
  })
}
//展示数据模块
function show_data(res) {
  //这里为了美观 做一下整体排序
  var text = res.text;
  //转化成数组
  text = text.split("。");
  //输出需要展示的数据
  that.setData({
    longtext: res.text,
    name: res.name,
    gs_title: res.title,
    text: text,
    title: res.title,
    all_text: res.title + "。" + res.name + "。" + res.text,
  })
  console.log(res);
}
//处理数据模块
function pro_data() {
  //判断是否大于1条数据
  if (db_result.length > 1) {
    console.log("结果集大于1条数据,开始随机选择");
    //获取随机数
    num = Math.floor(Math.random() * db_result.length);
    console.log("随机数:" + num);
    show_data(db_result[num]);
  }
  else {
    console.log("结果集仅一条数据,开始展示");
    show_data(db_result[0]);
  }
}
//搜索数据库
function search_db(key) {
  //清空临时数据库结果集
  db_result = "";
  db.collection('Chinese')
    .where({
      lx: key
    })
    .get()
    .then(res => {
      if (res.data.length > 0) {
        console.log(res);
        db_result = res.data;
        //开始处理数据
        pro_data();
      }
      else {
        console.log(res);
        pub.show_tip(0, "none", "获取数据异常", 0);
      }
    })
    .catch(err => {
      console.error(err);
      pub.show_tip(0, "none", "获取数据异常", 0);
    })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    play:'',
    stop:'display:none',
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    list2 = "";
    that=this;
    this.setData({
      title: options.id,
      play: '',
      stop: 'display:none',
    })
    search_db(options.id);
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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    pub.stopplay(that);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    pub.stopplay(that);
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
  //下一个单词
  next: function (e) {
    pub.stopplay(that);
    that.setData({
      math_num: 0,
    })
    list2 = "";
    if (db_result.length > num + 1) {
      num++;
      show_data(db_result[num]);
    }
    else {
      num = 0;
      show_data(db_result[num]);
    }
  },
  //上一个单词
  last: function (e) {
    pub.stopplay(that);
    list2 = "";
    that.setData({
      math_num: 0,
    })
    if (num > 0) {
      num--;
      show_data(db_result[num]);
    }
    else {
      num = db_result.length - 1;
      show_data(db_result[num]);
    }
  },
  read: function (e) {
    if (list2 != "") {
      console.log("音频已缓存,直接播放");
      pub.play_sound(list2,that,1);
    }
    else {
      pub.show_tip(2, "none", "数据请求中", 0);
      console.log("音频未缓存,开始请求接口");
      read_da();
    }
  },
  //停止或暂停播放
  stop:function(e){
    pub.stopplay(that);
  },
})