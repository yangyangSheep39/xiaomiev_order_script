# 🚗 小米汽车 App 订单监控

![Surge](https://img.shields.io/badge/Surge-✓-orange)
![Quantumult X](https://img.shields.io/badge/Quantumult%20X-待适配-lightgrey)
![Loon](https://img.shields.io/badge/Loon-✓-green)
![Stash](https://img.shields.io/badge/Stash-待适配-lightgrey)

这是一个脚本项目，用于自动追踪您的小米汽车（如 SU7、YU7）订单状态。配置完成后，它将静默在后台运行，并在订单状态发生关键变化时向您发送通知。

## ✨ 主要功能

* **一次性配置**：只需在小米汽车 App 中打开一次订单详情页，即可自动捕获所有必要信息。
* **智能通知**：
    * **每日报告**：每天早上 9:00，无论状态是否变化，都会发送一次完整的订单状态报告，让您安心。
    * **变更提醒**：在其他时间（每30分钟检查一次），仅当订单状态（如下线、运输等）发生**实际变更**时，才会发送即时通知。状态不变则不打扰。
* **远程安装**：通过 URL 一键安装，未来更新脚本只需维护上游仓库，所有设备自动同步，无需手动操作。
* **清晰日志**：脚本在代理软件的日志中输出带有 Emoji 的状态信息，方便快速定位和调试。

## ⚙️ 安装与配置

请根据您使用的代理软件，选择对应的配置方法。

<details>
<summary><strong>Surge (当前支持)</strong></summary>

**1. 复制模块链接**

   * **直连用户** (如海外用户):
       ```
       https://raw.githubusercontent.com/lonelyman0108/script/refs/heads/master/xiaomi_ev_order_monitor/surge/xiaomi_ev_order_monitor.sgmodule
       ```
   * **国内加速** (使用 `cdn.jsdelivr.net`):
       ```
       https://cdn.jsdelivr.net/gh/lonelyman0108/script@master/xiaomi_ev_order_monitor/surge/xiaomi_ev_order_monitor.sgmodule
       ```
       > 注意：Jsdelivr 有缓存，更新可能存在延迟。

**2. 在 Surge 中安装模块**

   * 打开 Surge App，切换到 `首页` -> `模块`。
   * 点击 `安装新模块`。
   * 将上一步复制的 URL 粘贴进去，点击 `好的`。
   * Surge 会自动下载并安装模块。请确保在模块列表中，该模块右侧的开关是**开启**状态。

**3. 确认 MitM 已启用**

   * 回到 Surge `首页`，点击 `MitM`。
   * 确保顶部的 `MitM` 总开关已开启。
   * 确保您已经按照 Surge 的指引，正确安装并信任了 Surge CA 证书。
   * 模块会自动将所需的主机名 `api.retail.xiaomiev.com` 添加到 MitM 主机名列表中。

</details>

<details>
<summary><strong>Quantumult X (待适配)</strong></summary>

- Quantumult X 的配置正在适配中，敬请期待。

</details>

[Loon一键安装插件](https://www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com/lonelyman0108/script/refs/heads/master/xiaomi_ev_order_monitor/loon/xiaomiev.plugin)

## 🚀 使用流程

安装和配置完成后，请按照以下步骤激活脚本：

**第1步：捕获订单信息（仅需一次）**

1.  保持您的代理软件正在运行，且 MitM 功能已开启。
2.  打开 **小米汽车 App**，进入**订单详情页面**。
3.  此时，脚本应会自动工作。如果一切顺利，您会收到一条标题为 **“✅ 小米汽车订单监控 - 信息捕获成功”** 的系统通知。

> **提示**：如果您长时间未收到此通知，请尝试彻底关闭小米汽车 App 后再重新进入订单详情页。

**第2步：等待自动通知**

捕获成功后，您无需再进行任何操作。脚本将进入全自动运行模式：
* 每天早上 9:00 您会收到一份“每日报告”。
* 当订单状态发生变更时，您会立即收到“状态变更”通知。

## 📄 文件说明

* **配置文件** (`*.sgmodule` / `*.conf`): 定义了 MitM 规则和脚本的远程路径，适配不同软件。
* **捕获脚本** (`...get.js`): HTTP-Request 脚本，用于在您访问 App 时捕获并保存请求头和请求体。
* **定时脚本** (`...check.js`): Cron 脚本，包含了所有定时任务的逻辑，会根据当前时间智能判断是执行“每日报告”还是“增量检查”。

## ⚠️ 注意事项

* **API 风险**：本脚本依赖小米汽车的非公开 API。如果未来小米官方对 API 地址、请求或响应结构进行修改，可能会导致本脚本失效，届时需要更新代码。
* **隐私安全**：您的订单请求信息（包含 Cookie 等）仅通过代理软件提供的持久化存储 API **保存在您自己的设备本地**，脚本本身不会将其上传到任何外部服务器。请确保您的设备安全。
* **个人项目**：本项目为个人兴趣驱动，仅供学习和交流使用，请勿用于商业用途。