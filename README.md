## 技术组件
- Expo SDK 58
- Expo Router
- React Native
- Gluestack-ui v5


## 环境准备
- Node.js v22.13.1及以上。
- AppStore 下载安装 Expo Go。

## 项目初始化
```bash
git clone https://github.com/polaris16/mars-app.git
cd mars-app
npm ci
```

在项目根目录运行 `npm ci` 即可安装依赖。
项目使用 `package-lock.json` 锁定依赖版本，`.npmrc` 已配置 `legacy-peer-deps=true`。克隆后执行的 `npm ci` 会读取这些配置。gluestack-ui 的组件源码和主题配置已经包含在项目中，安装依赖后即可使用。

## 启动与手机预览
在项目根目录启动服务。

```bash
npm start
```

1. 手机和电脑连接同一个 Wi-Fi。
2. 等待终端显示二维码，并保持开发服务运行。
3. 电脑、手机同账号登录expo。
```bash
npx expo login
```


## 其他启动方式

| 命令 | 用途 |
| --- | --- |
| `npm run android` | 启动开发服务，并尝试打开 Android 模拟器或已连接的 Android 设备 |
| `npm run ios` | 启动开发服务，并尝试打开 iOS 模拟器，需要 macOS 和 Xcode |
| `npm run web` | 启动 Web 开发服务，并在浏览器中打开 |


### 手机连接不上开发服务

先确认手机和电脑处于同一个 Wi-Fi。如果网络限制局域网设备互访，可以停止当前服务，改用 Tunnel 模式，再扫描新二维码。

```bash
npm start -- --tunnel
```

首次使用时，Expo CLI 可能会提示安装 Tunnel 所需依赖。Tunnel 模式加载速度通常比局域网慢。参见 [Expo 网络连接说明](https://docs.expo.dev/get-started/start-developing/)。
