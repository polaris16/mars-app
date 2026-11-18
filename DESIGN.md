# 美刻 App 设计规范

## 范围与实现

本规范适用于 Expo / React Native App 的所有页面，以及这些页面使用的共享组件：启动页、登录与引导、首页、发现、消息、我的、录音、记录列表、素材和弹窗，也包括开发调试页。采用 Apple iOS 的字体层级，保留现有 gluestack UI 组件和玻璃材质。

字体规则的唯一代码来源为 `src/constants/typography.ts`。页面通过 `Typography` 引用字号、行高和字重；`ThemedText`、`ButtonText` 与 `InputField` 也遵循此规则。不要在页面新增任意字号，或依赖 Tailwind 默认的 rem 字号来表达本规范。

以下以 Apple 默认的 Large 文字大小档位为基准。文字放大由系统设置控制；表中字号不是固定物理像素，也不是要求每种文字都使用正文大小。

## 字体层级

| Token | 字号 | 行高 | 字重 | App 用途 |
| --- | ---: | ---: | --- | --- |
| `largeTitle` | 34 | 41 | Bold / 700 | 顶层页面大标题、启动标题、录音计时器 |
| `title1` | 28 | 34 | Bold / 700 | 登录与引导页标题、首页宣传标题、素材页标题 |
| `title2` | 22 | 28 | Bold / 700 | 区块标题、个人资料卡片标题 |
| `title3` | 20 | 25 | Semibold / 600 | 次级标题、日期选择器数值 |
| `headline` | 17 | 22 | Semibold / 600 | 导航栏标题、列表标题、主要按钮和弹窗标题 |
| `body` | 17 | 22 | Regular / 400 | 正文、输入内容、菜单及普通操作 |
| `callout` | 16 | 21 | Regular / 400 | 需要弱于正文的补充内容 |
| `subhead` | 15 | 20 | Regular / 400 | 话题摘要、页面副标题、次要描述、表单标签 |
| `subheadEmphasized` | 15 | 20 | Semibold / 600 | 兴趣选项、辅助操作、需要强调的次要内容 |
| `footnote` | 13 | 18 | Regular / 400 | 时间、录音参数、错误说明、协议和操作提示 |
| `footnoteEmphasized` | 13 | 18 | Semibold / 600 | 分组说明、紧凑辅助操作和强调的时间信息 |
| `caption1` | 12 | 16 | Regular / 400 | 今日精选、数量、文件名、音质标签 |
| `caption1Emphasized` | 12 | 16 | Semibold / 600 | 选中数量和强调的状态标签 |
| `caption2` | 11 | 13 | Medium / 500 | 自定义 TabBar 标签，普通页面内容不使用 |

Apple 定义字号和行高层级；上表中的用途映射，以及标题和辅助文字的强调字重，是本 App 的设计约定。`Emphasized` 不新增字号层级，只改变字重。不要把所有标题都统一成同一个大小。

### 字体与单位

- 使用平台系统字体；iOS 自动使用系统支持的中英文字形，不嵌入或硬编码 SF Pro 字体文件。代码块使用系统等宽字体，计时数字使用 `tabular-nums`。
- React Native 的 `fontSize` / `lineHeight` 使用无单位逻辑数值。在 iOS 默认字体缩放下，可直接按 Apple 的 pt 数值设置，例如 `fontSize: 17`。
- NativeWind 的 `text-[17px]` 在原生端映射为数值 17，Web 端是 CSS 像素。不进行 CSS 中 pt 与 px 的 4/3 换算。
- 使用本规范时优先引用共享 token。不要同时用 `text-sm`、`leading-*` 等字号或行高工具类覆盖 token；颜色、布局工具类可以保留。
- 不设置全局字体家族或字重来覆盖原生控件。原生 iOS TabBar 的标签字号、行高与字重交给系统管理；只设置选中及未选中的颜色。

### 页面映射

- 首页：宣传标题 `title1`，推荐话题标题 `title2`，话题名称 `headline`，摘要与区块说明 `subhead`，人数与今日精选 `caption1`，主录音操作 `headline`。
- 发现、消息、我的：顶层标题 `largeTitle`；副标题与描述 `subhead`；列表入口 `headline`。
- 登录、个人资料、兴趣、角色选择：页面标题 `title1`，表单标签 `subhead`，输入文字 `body`，主按钮 `headline`，错误与协议 `footnote`。
- 记录列表与录音：紧凑导航栏标题 `headline`，录音标题 `headline`，时间与参数 `footnote`，总数与质量标签 `caption1`，计时器 `largeTitle`。
- 更多 / 素材：页面标题 `title1`，添加操作 `headline`，说明 `subhead`，格式提示 `footnote`，素材数量及文件名 `caption1`。
- 弹窗：标题 `headline`，消息正文 `body`，普通操作 `body`，确认或破坏性主操作 `headline`。
- 调试页：继续使用相同字号体系；代码内容可使用等宽 `footnote` 或 `caption1`，不使用小于 12 的字号。

### 缩放与布局

- 保持 `Text` / `TextInput` 默认的 `allowFontScaling`，不通过关闭缩放或限制最大字号来挤入布局。
- 文本使用与 token 对应的 iOS `dynamicTypeRamp`；`subhead` 对应 `subheadline`，强调版本沿用原层级。输入框保持原生的字体缩放行为。
- 文本按钮优先使用最小高度和垂直内边距；输入框为放大后的文字留出高度。固定图标尺寸不等同于文字字号。
- 卡片与描述随文字自然增高。主要内容优先换行，标题、数量和辅助标签可以重新排列；不要用缩小字体补救溢出。
- 日期选择器的行高随字体缩放调整，并保持滚动布局参数一致。
- 缩略图文件名可单行省略，因为空间受限且完整名称已用于该素材的可访问标签；普通说明和话题摘要不强制截断。
- 评审时覆盖小屏设备、长标题、空状态、错误状态、键盘出现，以及系统较大字体。原生效果需要在 iOS / Android 分别验证，Web 预览不能代替真机验收。

### 使用示例

```tsx
import { Typography } from '@/constants/typography';

<Text dynamicTypeRamp="headline" style={[Typography.headline, { color: '#0A0A0A' }]}>
  录音标题
</Text>
<Text dynamicTypeRamp="subheadline" style={[Typography.subhead, { color: '#737373' }]}>
  话题摘要与次要描述
</Text>
<ButtonText style={Typography.headline}>确认</ButtonText>
<InputField style={Typography.body} />
```

## 颜色角色

| 角色 | 值 | 用途 |
| --- | --- | --- |
| foreground | `#0A0A0A` | 标题及主要文字 |
| muted-foreground | `#737373` | 次要文字和状态 |
| primary | `#171717` | 主要操作表面 |
| primary-foreground | `#FAFAFA` | 深色操作表面上的文字 |
| card / background | `#FFFFFF` | 基础卡片与画布角色 |
| screen | `#F9F9FF` | 现有玻璃风格页面的底色 |
| muted / secondary | `#F5F5F5` | 低强调度辅助表面 |
| border / input | `#E5E5E5` | 分隔线和输入边框 |
| destructive | `#E7000B` | 错误及破坏性反馈的语义色 |
| selection-blue | `#007AFF` | 底部 TabBar 选中的图标与文字 |

玻璃表面统一复用 `GlassSurface`，其透明度、边框和阴影属于当前 App 的材质选择。未选中的 TabBar 标签使用 `#737373`。本次字体规范不要求把所有主要操作改为蓝色。

## 组件与维护

- gluestack UI 提供交互与组件结构，App 显式设置字体与颜色；安装核心包不会自动获得 Apple 字体层级。
- 页面不得通过修改业务数据、隐藏错误说明或关闭无障碍缩放来适配字号。
- 新增文字先选语义层级。需要新层级时先更新 `src/constants/typography.ts` 和本文，再调整调用方。
- 修改页面后运行 `npx expo lint`、`npx tsc --noEmit`。布局变化还应查看渲染结果，明确区分 Web 检查与原生检查。

## 官方参考

- [Apple Typography：字体层级与动态文字](https://developer.apple.com/design/human-interface-guidelines/typography)
- [React Native Text：字体缩放与 dynamicTypeRamp](https://reactnative.dev/docs/text)
- [React Native TextInput：输入文字缩放](https://reactnative.dev/docs/textinput)
- [NativeWind v5 单位说明](https://www.nativewind.dev/v5/core-concepts/units)
- [gluestack UI v5 安装与样式引擎](https://v5.gluestack.io/ui/docs/home/getting-started/installation)

此前文档中的 field-kit Web 示例是组件用法参考，其中的 40 / 52px 大标题、14px 按钮等数值不再作为本 App 的字体规范。
