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

//口语评测模块
function syncTransmitOralProcess(event) {
  const SoeClient = tencentcloud.soe.v20180724.Client;
  const models = tencentcloud.soe.v20180724.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "soe.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new SoeClient(cred, "", clientProfile);

  let req = new models.TransmitOralProcessWithInitRequest();

  //参数配置
  let VoiceFileType = 3;//音频类型
  let VoiceEncodeType = 1;//编码格式
  let UserVoiceData = event.base64;//音频文件base64
  let SessionId = guid();//唯一会话id
  let RefText = event.text;//音频对应文本
  let WorkMode = 1;//语音输入模式
  let EvalMode = 0;//评估模式
  let ScoreCoeff = 1.0;//评分标准
  let IsAsync = 1;//返回模式
  let IsEnd = 1;
  let SeqId = 1;
  let params = '{"VoiceFileType":"' + VoiceFileType + '","VoiceEncodeType":"' + VoiceEncodeType + '","UserVoiceData":"' + UserVoiceData + '","SessionId":"' + SessionId + '","RefText":"' + RefText + '","WorkMode":"' + WorkMode + '","EvalMode":"' + EvalMode + '","ScoreCoeff":"' + ScoreCoeff + '","IsAsync":"' + IsAsync + '","IsEnd":"' + IsEnd + '","SeqId":"' + SeqId + '"}';

  req.from_json_string(params);

  //封装返回结果
  return new Promise((resolve, reject) => {
    client.TransmitOralProcessWithInit(req, function (errMsg, response) {

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
  return syncTransmitOralProcess(event);
}