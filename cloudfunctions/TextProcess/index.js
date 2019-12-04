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

//智能对话模块
function syncTextProcess(event) {
  const TbpClient = tencentcloud.tbp.v20190311.Client;
  const models = tencentcloud.tbp.v20190311.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "tbp.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new TbpClient(cred, "ap-guangzhou", clientProfile);

  let req = new models.TextProcessRequest();
  /*
  请求参数说明
  BotId 机器人标识
  BotEnv 机器人版本
  TerminalId 终端标识
  InputText 请求文本
  */
  let text = event.text;
  let BotId = "c8c85c79-8cc9-4b63-993c-54b0b7ff56ca";
  let BotEnv = "release";
  let TerminalId = guid();
  let params = '{"BotId":"' + BotId + '","BotEnv":"' + BotEnv + '","TerminalId":"' + TerminalId + '","InputText":"' + text + '"}'

  req.from_json_string(params);

  // promise封装结果
  return new Promise((resolve, reject) => {
    client.TextProcess(req, function (errMsg, response) {

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
  return syncTextProcess(event);
}