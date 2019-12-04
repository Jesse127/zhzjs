/**
公共JS函数
设计:吴泽鑫、周俊伟
日期:2019-11-18
**/

//通用音频组件
const innerAudioContext = wx.createInnerAudioContext();

/*
清理缓存功能
由于是异步模块 因此不需要返回
*/

function deldir(){
    console.log("执行清理缓存");
    wx.clearStorage();//清理缓存
    let xx2 = wx.getFileSystemManager()
    const basepath = `${wx.env.USER_DATA_PATH}`
    xx2.readdir({
      dirPath: basepath,/// 获取文件列表
      success(res) {
        res.files.forEach((val) => { // 遍历文件列表里的数据
          xx2.unlink({
            filePath: basepath + '/' + val
          });
        })
        console.log(res);
      }, fail(err) {
        console.log("清理缓存出现问题:"+res);
      }
    })
}

/*
随机数模块
*/

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/*
通用播放声音模块
由于是异步模块 因此不需要返回
*/

function play_sound(audio,that,type) {
    if(type != '' && type != null)
    {
        //清理缓存
        deldir();
    }
    var audio_long=0;//临时变量
    //初始化临时文件名
    var filepath = `${wx.env.USER_DATA_PATH}/` + guid() + `.wav`;
    //停止在播放的音频
    innerAudioContext.stop();
    //音频base64处理
    wx.getFileSystemManager()
    .writeFile({
    filePath: filepath,
    data: audio,
    encoding: 'base64',
    success: res => {
        //播放声音
        innerAudioContext.autoplay = true;
        innerAudioContext.src = filepath;
        innerAudioContext.play();
        if(that != '' && that != null)
        {
            that.setData({
                play:'display:none',
                stop:'',
            })
        }
        innerAudioContext.onError((res) => {
            show_tip(0,"none","播放音频出现错误",0);
            console.log(res);
        })
        //获取时间
        innerAudioContext.onTimeUpdate(() => {
            if(audio_long == 0)
            {
                audio_long = 1;
                //追加数组模块 并非全部要使用
                if(that != '' && that != null)
                {
                    var aa = {
                        src: filepath,
                        width: 10,
                        play: false,
                        type: false,//腾讯云回复的消息
                        shijian: parseInt(innerAudioContext.duration),
                    }
                    that.data.list.push(aa);
                    var list = that.data.list
                    that.setData({
                        list: list
                    })
                }else
                {
                    //清理缓存
                    deldir();
                }
            }
        })
        //播放停止事件
        innerAudioContext.onEnded(() => {
            console.log('结束播放');
            if(that != '' && that != null)
            {
                that.setData({
                    play:'',
                    stop:'display:none',
                })
            }
        })
    },
    fail: res => {
        show_tip(0,"none","处理音频文件出现错误",0);
        console.log(res);
    }
    })
}
/**
 * 停止播放事件
 */
function stopplay(that){
    innerAudioContext.stop();
    that.setData({
        play:'',
        stop:'display:none',
    })
}

/**
 * 删除云存储文件
 */
function del_file(file){
  wx.cloud.deleteFile({
    fileList: [file],
    success: res => {
      console.log(res);
    },
    fail: err => {
      console.log(err);
    }
  })
}

/*
通用弹框程序
*/

function show_tip(type,icon,title,timer){
    if(type == 0) //默认弹窗
    {
        wx.showToast({
            icon: icon,
            title: title,
        })
    }
    else if(type == 1) //带时间的弹窗
    {
        wx.showToast({
            icon: icon,
            title: title,
            duration:timer,
        })
    }
    else if(type == 2) //loading效果弹窗
    {
        wx.showLoading({
            title: title,
        })
    }
    else if(type == 3)//关闭弹窗
    {
        wx.hideLoading();
    }
}

//转化成小程序模板语言
module.exports = {
    guid: guid,
    deldir:deldir,
    play_sound:play_sound,
    show_tip:show_tip,
    del_file:del_file,
    stopplay:stopplay,
}