// 云函数入口文件
const cloud = require('wx-server-sdk')
var fs = require('fs');
cloud.init()
const tencentcloud = require("tencentcloud-sdk-nodejs");//调用腾讯云SDK

//语音识别模块
function syncSentenceRecognition(event) {
  const AsrClient = tencentcloud.asr.v20190614.Client;
  const models = tencentcloud.asr.v20190614.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "asr.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new AsrClient(cred, "", clientProfile);

  let req = new models.SentenceRecognitionRequest();

  let ProjectId = 0;
  let SubServiceType = 2;
  let EngineServiceType = "16k";
  let SourceType = 0;
  let VoiceFormat = "mp3";
  let Url = event.url;
  let UsrAudioKey = "www";
  let params = '{"ProjectId":"' + ProjectId + '","SubServiceType":"' + SubServiceType + '","EngSerViceType":"' + EngineServiceType + '","SourceType":"' + SourceType + '","VoiceFormat":"' + VoiceFormat + '","Url":"' + Url + '","UsrAudioKey":"' + UsrAudioKey + '"}'

  req.from_json_string(params);

  // promise封装结果
  return new Promise((resolve, reject) => {
    client.SentenceRecognition(req, function (errMsg, response) {

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
  return syncSentenceRecognition(event);
}