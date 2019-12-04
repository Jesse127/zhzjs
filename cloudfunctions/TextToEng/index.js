// 云函数入口文件
const cloud = require('wx-server-sdk')
var fs = require('fs');
cloud.init()
const tencentcloud = require("tencentcloud-sdk-nodejs");//调用腾讯云SDK

//文本翻译模块
function synctranslate(event) {
  let text = event.text;
  const TmtClient = tencentcloud.tmt.v20180321.Client;
  const models = tencentcloud.tmt.v20180321.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "tmt.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new TmtClient(cred, "ap-guangzhou", clientProfile);

  let req = new models.TextTranslateRequest();
  /**
   * 识别参数
   * SourceText 需要识别的文本
   * ProjectId 项目ID
   * Source 源文语言
   * Target 目标语言
  ***/
  let params = '{"SourceText":"' + text + '","ProjectId":0,"Source":"zh","Target":"en"}'
  console.log(params);
  req.from_json_string(params);

  // promise封装结果
  return new Promise((resolve, reject) => {
    client.TextTranslate(req, function (errMsg, response) {

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
  return synctranslate(event);
}