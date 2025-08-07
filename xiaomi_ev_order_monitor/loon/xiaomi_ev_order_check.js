/*
 * @file xiaomi_ev_order_check.js
 * @description 定时任务脚本。检查当前时间，决定执行每日报告还是增量检查。
 */

const url = "https://api.retail.xiaomiev.com/mtop/carlife/product/order";
const headersKey = "xiaomi_ev_headers";
const bodyKey = "xiaomi_ev_body";
const lastStatusKey = "xiaomi_ev_last_status";

// 主函数
(async () => {
    console.log("🚗 [小米汽车] 开始执行定时检查任务...");

    const headersStr = $persistentStore.read(headersKey);
    const body = $persistentStore.read(bodyKey);

    if (!headersStr || !body) {
        console.log("❓ [小米汽车] 尚未捕获订单信息，任务终止。");
        $notification.post("⚠️ 小米汽车订单监控", "需要您进行操作", "尚未捕获订单信息，请打开小米汽车App的订单详情页面以完成初始化。");
        $done();
        return;
    }

    const headers = JSON.parse(headersStr);
    const requestOptions = {url, method: "POST", headers, body};

    $httpClient.post(requestOptions, (error, response, data) => {
        if (error) {
            console.log("🚨 [小米汽车] 请求失败:", error);
            $notification.post("❌ 小米汽车订单监控", "小米汽车订单状态查询请求失败", "请检查网络或Surge日志。");
            $done();
            return;
        }

        try {
            const result = JSON.parse(data);
            const orderDetailDto = result.data.orderDetailDto;

            if (!orderDetailDto || !orderDetailDto.statusInfo || !orderDetailDto.statusInfo.orderStatus) {
                console.log("📄 [小米汽车] 解析数据失败：JSON结构可能已变更。");
                $notification.post("❌ 小米汽车订单监控", "小米汽车订单数据解析失败", "无法找到订单状态信息。");
                $done();
                return;
            }

            const statusInfo = orderDetailDto.statusInfo;
            const orderTimeInfo = orderDetailDto.orderTimeInfo;

            const currentStatus = String(statusInfo.orderStatus);
            const currentStatusName = statusInfo.orderStatusName || "N/A";
            const lastStatus = $persistentStore.read(lastStatusKey);
            const currentHour = new Date().getHours();
            let remainingTime = "";
            if (orderTimeInfo && orderTimeInfo.deliveryTime && orderTimeInfo.deliveryTime.includes('预计还需')) {
                remainingTime = orderTimeInfo.deliveryTime.split('预计还需')[1].trim();
            }

            // 检查当前小时是否为9点，决定执行哪种逻辑
            if (currentHour === 9) {
                // --- 每日报告逻辑 ---
                console.log(`☀️ [小米汽车] 现在是${currentHour}点，执行每日报告。`);
                $persistentStore.write(currentStatus, lastStatusKey);
                console.log(`💾 [小米汽车] 已将最新状态码 ${currentStatus} 保存为基准。`);

                const customStatus = parseOrderStatus(currentStatus);
                const title = "☀️ 小米汽车每日订单报告";
                const subtitle = `实际状态: ${customStatus}`;
                const content = `剩余时间: ${remainingTime}\nAPP状态: ${currentStatusName}\n报告时间: ${new Date().toLocaleTimeString("zh-CN")}`;
                $notification.post(title, subtitle, content);
            } else {
                // --- 增量检查逻辑 ---
                console.log(`🔄 [小米汽车] 现在是${currentHour}点，执行增量检查。`);
                if (!lastStatus) {
                    // 如果没有基准状态（例如首次运行），则只保存不通知
                    console.log(`🤔 [小米汽车] 尚无基准状态，已将当前状态 ${currentStatus} 保存,并通知。`);
                    $persistentStore.write(currentStatus, lastStatusKey);

                    const customStatus = parseOrderStatus(currentStatus);
                    const title = "✅ 小米汽车订单状态获取！";
                    const subtitle = `实际状态: ${customStatus}`;
                    const content = `剩余时间: ${remainingTime}\nAPP状态: ${currentStatusName}\n获取时间: ${new Date().toLocaleTimeString("zh-CN")}`;
                    $notification.post(title, subtitle, content);
                } else if (currentStatus !== lastStatus) {
                    console.log(`🔔 [小米汽车] 状态已变更! 旧: ${lastStatus}, 新: ${currentStatus}`);
                    $persistentStore.write(currentStatus, lastStatusKey);

                    const customStatus = parseOrderStatus(currentStatus);
                    const title = "🔔 小米汽车订单状态变更！";
                    const subtitle = `实际新状态: ${customStatus}`;
                    const content = `剩余时间: ${remainingTime}\nAPP新状态: ${currentStatusName}\n变更时间: ${new Date().toLocaleTimeString("zh-CN")}`;
                    $notification.post(title, subtitle, content);
                } else {
                    console.log("😴 [小米汽车] 状态无变化，判断是否静默处理。获取开关状态为：" + $argument.arg2);
                    if ($argument.arg2) {
                        console.log("😴 [小米汽车] 状态无变化，且已配置静默处理，无须发送通知。");
                    } else {
                        const content = `剩余时间: ${remainingTime}\nAPP当前状态: ${currentStatusName}\n当前时间: ${new Date().toLocaleTimeString("zh-CN")}`;
                        $notification.post("😴 [小米汽车] 状态无变化，静默处理。", subtitle, content);
                    }

                }
            }
        } catch (e) {
            console.log("💥 [小米汽车] 解析JSON失败:", e);
            $notification.post("❌ 小米汽车订单监控", "小米汽车订单响应解析失败", "无法解析服务器返回的数据。");
        } finally {
            $done();
        }
    });
})();

function parseOrderStatus(status) {
    const statusStr = String(status);
    switch (statusStr) {
        case "2520":
            return "❌ 未下线";
        case "2605":
            return "🏭 已下线，未运输";
        case "3000":
            return "🚚 已下线，运输中";
        default:
            return "❓ 未知状态";
    }
}
