/*
 * @file xiaomi_ev_get_info.js
 * @description 捕获小米汽车订单请求的完整Header和Body
 */

const urlPrefix = "https://api.retail.xiaomiev.com/mtop/carlife/product/order";
const headersKey = "xiaomi_ev_headers";
const bodyKey = "xiaomi_ev_body";

// 确保是POST请求
if (
  $request.method.toUpperCase() === "POST" &&
  $request.url.startsWith(urlPrefix)
) {
  const headers = $request.headers;
  const body = $request.body;

  if (headers && body) {
    // 将headers对象转换为字符串进行存储
    $persistentStore.write(JSON.stringify(headers), headersKey);
    $persistentStore.write(body, bodyKey);
    console.log("📥 [小米汽车] 订单信息捕获成功");
    $notification.post(
      "✅ 小米汽车订单监控",
      "信息捕获成功",
      "现在您可以等待定时任务自动查询订单状态了。"
    );
  } else {
    console.log("❌ [小米汽车] 订单信息捕获失败：未找到Header或Body");
    $notification.post(
      "❌ 小米汽车订单监控",
      "信息捕获失败",
      "请检查请求是否正确。"
    );
  }
}

// 让原始请求继续
$done({});
