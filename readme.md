# 🗂️ dada-car-uniapp 目录结构规划文档

## ✅ 顶层结构说明

```bash
dada-car-uniapp/
├── api/                # 所有后端接口请求封装
├── assets/             # 设计图、素材等本地资源（可选）
├── components/         # 公共组件封装（如验证码按钮、弹窗）
├── constants/          # 枚举、状态码、配置常量
├── hooks/              # 组合式逻辑（如 useLogin/useAuth）
├── layouts/            # 通用页面结构，如 TabLayout、EmptyLayout
├── pages/              # 小程序/APP 页面（按照业务模块拆分）
├── static/             # 静态资源（车辆图、logo、默认头像等）
├── store/              # Pinia 状态管理（按模块组织）
├── utils/              # 通用工具函数（toast、时间、校验等）
├── uni_modules/        # 插件市场组件
├── unpackage/          # 编译生成文件（勿动）
├── App.vue             # 全局 App 入口
├── main.js             # 应用主入口（初始化逻辑）
├── pages.json          # 页面路由配置
├── manifest.json       # 平台适配配置
└── package.json        # 依赖与脚本
```

---

## 📂 `api/` 接口封装

**说明**：封装所有后端请求，统一管理 URL、header、token 注入等。

```bash
api/
├── index.js            # 通用接口封装
├── user.js             # 用户相关接口（登录/注册/认证）
├── order.js            # 订单模块接口
├── coupon.js           # 优惠券模块接口
└── ...
```

---

## 📂 `components/` 公共组件

```bash
components/
├── CodeButton.vue      # 验证码倒计时按钮
├── EmptyView.vue       # 空数据占位图
├── ConfirmDialog.vue   # 通用确认弹窗
└── ...
```

---

## 📂 `constants/` 枚举与配置（建议新增）

```bash
constants/
├── enums.js            # 性别、订单状态、车类型枚举
├── apiCodes.js         # 后端返回状态码定义
├── config.js           # 项目通用配置（如 CDN 路径）
└── ...
```

---

## 📂 `hooks/` 组合式逻辑（建议新增）

```bash
hooks/
├── useUserInfo.js      # 获取用户信息并缓存
├── useLocation.js      # 获取定位并缓存
├── useOrderStatus.js   # 查询订单状态
└── ...
```

---

## 📂 `layouts/` 页面布局结构（可选）

```bash
layouts/
├── TabLayout.vue       # 有底部导航的页面结构
├── AuthLayout.vue      # 登录/注册页面布局
└── ...
```

---

## 📂 `pages/` 页面结构（业务模块）

```bash
pages/
├── index/              # 启动页（判断是否登录）
├── login/              # 登录页面
├── register/           # 注册页面（如有）
├── home/               # 首页
├── me/                 # 个人中心
├── order/              # 订单列表 + 下单/还车页面
├── vehicle/            # 地图找车、车辆详情
├── coupon/             # 卡券中心
├── profile/            # 编辑个人资料
├── certification/      # 实名认证
├── group/              # 车友群引导
├── promo/              # 推广奖励
├── points/             # 积分系统
└── ...
```

---

## 📂 `store/` 状态管理

```bash
store/
├── user.js             # 用户状态：token、userInfo
├── order.js            # 当前订单状态管理
├── vehicle.js          # 车辆选择、推荐车辆缓存
└── ...
```

---

## 📂 `utils/` 工具函数

```bash
utils/
├── uniToast.js         # Toast 显示封装
├── validate.js         # 表单校验
├── time.js             # 时间格式处理
├── storage.js          # uni.set/get/removeStorageSync 封装
└── ...
```

---

## 📂 `static/` 静态资源

```bash
static/
├── logo.png
├── avatar.png
├── cars/               # 车辆图片
├── group_qrcode.png    # 微信群二维码
└── ...
```

---

## ✅ 推荐开发习惯

| 项目     | 建议做法                          |
| ------ | ----------------------------- |
| 状态管理   | 使用 Pinia，按模块拆分                |
| 路由跳转   | 全部用 `uni.navigateTo` 封装跳转     |
| 接口返回结构 | 统一为 `{ code, data, message }` |
| 登录跳转   | 启动页判断 token 自动跳转 login/home   |
| 页面样式   | 统一尺寸单位为 `rpx`，使用 scoped       |
	

| 类型                            | 说明                   | 建议策略               |
| ----------------------------- | -------------------- | ------------------ |
| 🚗 车辆押金（Yajin）            | 押金确保车辆安全，如事故、故障、违章未缴 | ✅ 初次使用缴纳，后续可通过信用免押 |
| 🛡 保险（No-Deductible）费用    | 用户发生事故是否需要自付         | ✅ 默认“勾选购买”或按车型强制收取 |
| ⚠️ 违章保证金（Illegal Deposit）| 用户违章但无法即时处罚时使用       | ✅ 可与押金合并，或单独冻结部分余额 |
| 💸 租金预支付                | 租车费用（含优惠后）           | ✅ 必须预支付，避免逃单       |
