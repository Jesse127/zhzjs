// 云函数入口文件
const cloud = require('wx-server-sdk')
var fs = require('fs');
cloud.init()
const tencentcloud = require("tencentcloud-sdk-nodejs");//调用腾讯云SDK

//唯一会话ID生成模块
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//朗读模块
function syncTextToVoice(event) {
  const AaiClient = tencentcloud.aai.v20180522.Client;
  const models = tencentcloud.aai.v20180522.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "aai.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new AaiClient(cred, "ap-guangzhou", clientProfile);

  let req = new models.TextToVoiceRequest();
  /** 
   参数说明
    text 需要朗读的文本
    SessionId 唯一会话ID
    ModelType 模型类型
    Volume 音量大小
    Speed 语速
    ProjectId 项目ID
    VoiceType 音色
    Codec 音频格式
  **/
  let SessionId = guid();
  let Volume = 0;
  let Speed = event.speed;
  let VoiceType = 0;
  let Codec = "wav";
  let text = event.text;
  let params = '{"Text":"' + text + '","SessionId":"' + SessionId + '","ModelType":0,"Volume":"' + Volume + '","Speed":"' + Speed + '","ProjectId":0,"VoiceType":"' + VoiceType + '","Codec":"' + Codec + '"}' //接口参数
  req.from_json_string(params);

  // promise封装结果
  return new Promise((resolve, reject) => {
    client.TextToVoice(req, function (errMsg, response) {

      if (errMsg) {
        reject(errMsg);
        return;
      }
      resolve(response);
    });
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  return syncTextToVoice(event);
}