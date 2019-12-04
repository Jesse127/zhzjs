// 云函数入口文件
const cloud = require('wx-server-sdk')
var fs = require('fs');
cloud.init()
const tencentcloud = require("tencentcloud-sdk-nodejs");//调用腾讯云SDK

//图片标签模块
function syncDetectLabel(event) {
  let imgBase64 = event.imgBase64;
  const TiiaClient = tencentcloud.tiia.v20190529.Client;
  const models = tencentcloud.tiia.v20190529.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("********", "********");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "tiia.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new TiiaClient(cred, "ap-guangzhou", clientProfile);

  let req = new models.DetectLabelRequest();

  let params = '{"ImageUrl":"' + imgBase64 + '"}' //需要上传的图片URL地址
  console.log(params);
  req.from_json_string(params);

  // promise封装结果
  return new Promise((resolve, reject) => {
    client.DetectLabel(req, function (errMsg, response) {

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
  return syncDetectLabel(event);
}