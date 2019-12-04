// pages/learnWord/learnWord.js
var pub = require('../../temple/js/function.js');//引用公共js模块
//临时存储数据库结果集
var db_result = "";
//已学习单词缓存
var learned = "[]",num;
learned = JSON.parse(learned);
//置随机数种子
var num = Math.random();
//锁模块 用于控制录音键
var lock = false, lock_end = 0;
//定时器全局
var lock_timer = ""
//音频文件存储
var list,list2="";
// 创建数据库实例
var that;
const db = wx.cloud.database();
//播放答案
function read_da() {
  list2 = "";
  wx.cloud.callFunction({
    name: "TextToVoice",
    data: {
      //传参给云函数
      "text": that.data.dc,
      "speed":0,
    },
    success: (res) => {
      pub.show_tip(3, 0, 0, 0);
      var result = res.result;
      console.log(result);
      list2 = result.Audio;
      //播放声音
      pub.play_sound(list2);
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "朗读失败", 0);
    }
  })
}
//口语评测模块
function checken(base64) {
  wx.cloud.callFunction({
    name: "Speak_Test",
    data: {
      //传参给云函数
      "text": that.data.english,
      "base64": base64
    },
    success: (res) => {
      console.log(res);
      that.setData({
        math_num: parseInt(res.result.SuggestedScore)
      });
      pub.show_tip(3, 0, 0, 0);
    },
    fail: (res) => {
      console.log(res);
      pub.show_tip(0, "none", "评测异常", 0);
    }
  })
}
//音频转base64
function voicetobase64(filePath) {
  list = "";
  wx.getFileSystemManager().readFile({
    filePath: filePath,
    encoding: 'base64', //编码格式
    success: res => { //成功的回调
      list = res.data;
      //console.log(res.data);
      //开始进行口语评测
      checken(res.data);
    },
    fail:res=>{
      console.log(res);
      pub.show_tip(0, "none", "音频处理异常", 0);
    }
  })
}
//展示数据模块
function show_data(res)
{
  //输出需要展示的数据
  that.setData({
    english:res.english,
    title: res.english,
    chinese:res.chinese,
    img_url:res.img_url,
    dc: res.english +"。" + res.chinese
  })
  console.log(res);
}
//处理数据模块
function pro_data(){
  //判断是否大于1条数据
  if (db_result.length > 1)
  {
    console.log("结果集大于1条数据,开始随机选择");
    //获取随机数
    num = Math.floor(Math.random() * db_result.length);
    console.log("随机数:"+num);
    show_data(db_result[num]);
  }
  else
  {
    console.log("结果集仅一条数据,开始展示");
    show_data(db_result[0]);
  }
}
//搜索数据库
function search_db(key)
{
  //清空临时数据库结果集
  db_result = "";
  db.collection('English')
    .where({
      lx:key
    })
    .get()
    .then(res => {
      if(res.data.length > 0)
      {
        db_result = res.data;
        //开始处理数据
        pro_data();
      }
      else
      {
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
    english: 'word',
    chinese: '中文',
    math_num:0,
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    list2 = "";
    that = this;
    this.setData({
      title: options.title,
    })
    //判断参数匹配数据库
    search_db(options.title);
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
            pub.show_tip(2, "none", "正在评测", 0);
            //录音完成上传语音文件
            voicetobase64(res.tempFilePath);
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
  //ai朗读答案
  read: function (e) {
    if (list2 != "")
    {
      console.log("音频已缓存,直接播放");
      pub.play_sound(list2);
    }
    else
    {
      pub.show_tip(2, "none", "数据请求中", 0);
      console.log("音频未缓存,开始请求接口");
      read_da();
    }
  },
  //下一个单词
  next:function(e)
  {
    pub.stopplay(that);
    that.setData({
      math_num: 0,
    })
    list2 = "";list = "";
    if(db_result.length>num+1)
    {
      num++;
      show_data(db_result[num]);
    }
    else
    {
      num=0;
      show_data(db_result[num]);
    }
  },
  //上一个单词
  last:function(e)
  {
    pub.stopplay(that);
    list2="";list="";
    that.setData({
      math_num: 0,
    })
    if (num > 0) {
      num--;
      show_data(db_result[num]);
    }
    else
    {
      num=db_result.length-1;
      show_data(db_result[num]);
    }
  },
  soundmy:function(e){
    if (list == "" || list == null)
    {
      pub.show_tip(0, "none", "请先跟读单词", 0);
    }
    else
    {
      pub.play_sound(list);
    }
  }
})