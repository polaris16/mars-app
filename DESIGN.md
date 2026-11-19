# 美刻 App 设计规范

## 范围与实现

本规范适用于 Expo / React Native App 的所有页面，以及这些页面使用的共享组件：启动页、登录与引导、首页、发现、消息、我的、录音、记录列表、素材和弹窗，也包括开发调试页。以 Apple iOS Human Interface Guidelines（HIG）为依据，使用现有 gluestack UI 组件实现交互；组件库本身不保证符合 iOS 规范。

核对日期：2026-11-19。本文区分 Apple 指南、本 App 的视觉约定和当前实现差距。自定义字号强调、48pt 输入框、左对齐标题、浅灰画布等是项目选择，不是 Apple 对所有 App 的强制要求；更新本文不等于当前 App 已通过无障碍或原生体验验收。

字体规则的唯一代码来源为 `src/constants/typography.ts`。页面通过 `Typography` 引用字号、行高和字重；`ThemedText`、`ButtonText` 与 `InputField` 也遵循此规则。不要在页面新增任意字号，或依赖 Tailwind 默认的 rem 字号来表达本规范。

以下以 iOS 默认的 Large 文字大小档位为基准，记录当前 App 的 token。文字放大由系统设置控制；表中字号不是固定物理像素，也不是要求每种文字都使用正文大小。

## 字体层级

| Token | 基准字号 | 基准行高 | App 字重 | App 用途 |
| --- | ---: | ---: | --- | --- |
| `largeTitle` | 34 | 41 | Bold / 700 | 顶层页面大标题、启动页产品名、录音计时器 |
| `title1` | 28 | 34 | Bold / 700 | 登录与引导页标题、首页宣传标题 |
| `title2` | 22 | 28 | Bold / 700 | 区块标题、个人资料卡片标题 |
| `title3` | 20 | 25 | Semibold / 600 | 次级标题、日期选择器数值；启动页副标题使用 Regular |
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

表中字号和基准行高与 Apple 的 iOS Large 档位对应，字重和用途映射是本 App 的设计约定。Apple 表中 Large Title、Title 1 / 2 / 3 的基础字重为 Regular，可采用相应的强调字重；本 App 使用 Bold / Semibold。`caption2` 的 Medium 是项目选择，Apple 基础样式为 Regular，原生 TabBar 的实际标签样式仍由系统决定。`Emphasized` 不新增字号层级，只改变字重。参见 [Apple Typography](https://developer.apple.com/design/human-interface-guidelines/typography)。

17pt 是 iOS 推荐的默认文字尺寸，11pt 是指南列出的最小参考值，不能把 11pt 当作通用正文尺寸。当前 App 对普通页面内容采用至少 12pt 的约定；重要信息优先使用 `body` 或更大的语义层级。

### 字体与单位

- 使用平台系统字体；iOS 自动使用系统支持的中英文字形，不嵌入或硬编码 SF Pro 字体文件。代码块使用系统等宽字体，计时数字使用 `tabular-nums`。
- React Native 的 `fontSize` / `lineHeight` 使用无单位逻辑数值。在 iOS 默认字体缩放下，可直接按 Apple 的 pt 数值设置，例如 `fontSize: 17`。
- NativeWind 的 `text-[17px]` 在原生端映射为数值 17，Web 端是 CSS 像素。不进行 CSS 中 pt 与 px 的 4/3 换算。
- 项目 `metro.config.js` 显式设置 `inlineRem: 16`，因此 `min-h-12` 在当前原生配置中对应 48 个逻辑单位。不要假设其他项目或 NativeWind 默认 rem 配置也相同。
- 使用本规范时优先引用共享 token。不要同时用 `text-sm`、`leading-*` 等字号或行高工具类覆盖 token；颜色、布局工具类可以保留。
- 不设置全局字体家族或字重来覆盖原生控件。原生 iOS TabBar 的标签字号、行高与字重交给系统管理；只设置选中及未选中的颜色。

硬编码基准 `fontSize` / `lineHeight` 不等于完整复刻原生文本样式。`dynamicTypeRamp` 指定缩放参考样式，`allowFontScaling` 控制字体缩放；必须共同检查实际显示。自定义 `fontWeight` 也不代表已自动适配系统“粗体文本”设置。

### 页面映射

- 启动页：产品名“美刻”是唯一主标题，使用 `largeTitle`（34 / 41 / 700）；“此刻，即美好”为副标题，使用 `title3` 的字号和行高（20 / 25），字重 Regular / 400；“m · 陪伴 · 温暖 · 美好时刻”为解释说明，使用 `subhead`（15 / 20 / 400）及次要文字色。Logo 和产品名归为一组，副标题与说明归为一组，组间距 32pt、说明间距 12pt；小屏和大字体下允许换行、增高和滚动。这是基于 iOS 语义字体建立的品牌层级映射，不是 Apple 规定的固定启动页模板。
- 首页、发现、消息、我的是同一级 Tab 入口：顶部标题统一使用 `largeTitle`（34 / 41 / 700），副标题统一使用 `subhead`（15 / 20 / 400），标题与副标题间距为 6。首页顶部“美刻”也遵循此规则。
- 首页：宣传标题 `title1`，推荐话题标题 `title2`，话题名称 `headline`，摘要与区块说明 `subhead`，人数与今日精选 `caption1`，主录音操作 `headline`。
- 发现、消息、我的：顶层标题 `largeTitle`；副标题与描述 `subhead`；列表入口 `headline`。
- 登录、个人资料、兴趣、角色选择：页面标题 `title1`，表单标签 `subhead`，输入文字 `body`，主按钮 `headline`，错误与协议 `footnote`。
- 记录列表与录音：自定义二级页标题分别为“历史”和“记录”，使用 `headline`（17 / 22 / 600），与返回按钮并排左对齐。录音卡片标题 `headline`，时间与参数 `footnote`，总数与质量标签 `caption1`，计时器 `largeTitle`。
- 素材：导航栏标题为“素材”，使用 `headline`（17 / 22 / 600），与返回按钮并排左对齐。内容区直接展示添加入口或素材列表，添加操作 `headline`，格式提示 `footnote`，素材数量及文件名 `caption1`。
- 弹窗：自定义弹窗标题 `headline`，消息正文 `body`，普通操作 `body`，主操作可用 `headline`。破坏性操作通过明确文案和语义色表达，不只依赖加粗。原生 Alert 保留系统排版。
- 调试页：继续使用相同字号体系；代码内容可使用等宽 `footnote` 或 `caption1`，不使用小于 12 的字号。

以上页面标题、对齐方式和 6pt 标题间距是 App 的一致性约定。原生导航栏优先采用系统标题布局，不把自定义左对齐规则强加给系统导航栏，也不把这些映射表述成 HIG 的固定模板。

### 缩放与布局

- 保持 `Text` / `TextInput` 默认的 `allowFontScaling`，不通过关闭缩放或限制最大字号来挤入布局。
- 文本使用与 token 对应的 iOS `dynamicTypeRamp`；`subhead` 对应 `subheadline`，强调版本沿用原层级。输入框保持原生的字体缩放行为。
- 支持较大的辅助功能字号，至少覆盖 200% 字体放大，并检查 iOS 最大辅助功能档位。`fontScale` 计算只是容器高度的估算，不替代对原生字形、行高和所有内容尺寸档位的验证。
- 文本按钮优先使用最小高度和垂直内边距；输入框为放大后的文字留出高度。固定图标尺寸不等同于文字字号。
- 单行输入框以 48pt 为最小高度，统一通过 `useInputHeight` 随系统字体缩放增高，预留上下各 12pt 内边距及上下各 1pt 边框。共享 `Input`、手机号、验证码、昵称、重命名和日期选择框遵循此约定；48pt 是本 App 的设计选择，并非 Apple 强制规定。输入区域不使用固定百分比高度限制文字增长。
- 卡片与描述随文字自然增高。主要内容优先换行，标题、数量和辅助标签可以重新排列；不要用缩小字体补救溢出。
- 大字体下将拥挤的横向内容改为纵向布局，按需减少网格列数；有信息含义的自定义图标也应相应放大，不能始终用固定小图标配大文字。
- 日期选择器的行高随字体缩放调整，并保持滚动布局参数一致。
- 缩略图文件名可单行省略，因为空间受限且完整名称已用于该素材的可访问标签；普通说明和话题摘要不强制截断。
- 评审时覆盖小屏设备、长标题、空状态、错误状态、键盘出现，以及系统较大字体。原生效果需要在 iOS / Android 分别验证，Web 预览不能代替真机验收。

### 使用示例

```tsx
import { Typography } from '@/constants/typography';

<Text dynamicTypeRamp="headline" style={[Typography.headline, { color: '#0A0A0A' }]}>
  录音标题
</Text>
<Text dynamicTypeRamp="subheadline" style={[Typography.subhead, { color: '#6B6B6B' }]}>
  话题摘要与次要描述
</Text>
<ButtonText dynamicTypeRamp="headline" style={Typography.headline}>确认</ButtonText>
<InputField style={Typography.body} />
```

## 交互尺寸与输入

- 常规交互目标按至少 44 × 44pt 设计，包括返回、添加、清除、关闭、更多操作和素材删除。这里指可交互区域，图标本身可以更小。Apple 当前无障碍表列出默认 44 × 44pt、最小 28 × 28pt；28pt 不作为本 App 常用操作的设计目标。[Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- 小图标优先通过容器留出触控空间。使用 `hitSlop` 时核对父容器裁剪和相邻目标，避免扩展后触控区域重叠；不能只看图标或样式数值判断可点击面积。
- 单行输入默认最小 48pt，并允许增高；多行文本使用可增长或可滚动的文本区域。48pt、12pt 内边距、1pt 边框属于本 App 约定，不能要求所有系统控件套用相同尺寸。
- 输入框保留可见标签和明确的占位提示，输入后仍能辨认字段用途；错误说明靠近对应字段。手机号、验证码等选择匹配的键盘和自动填充类型。遵循系统光标、选区、编辑菜单和焦点行为。[Apple Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)
- 按钮提供按下、禁用和加载反馈，图标按钮使用能说明动作的可访问名称。不可逆删除需要可理解的确认，能够恢复时可提供撤销；普通成功反馈不滥用中断式 Alert。[Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)、[Apple Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)

## 导航与安全区域

- TabBar 用于首页、发现、消息、我的等顶层分区；录音和添加素材属于操作，不作为替代导航的 Tab。保留各分区的导航状态，并提供清晰的返回路径。[Apple Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- 背景可以延伸到屏幕边缘；正文和关键操作遵守动态安全区域。悬浮操作区、TabBar 和键盘不得遮住最后一项内容或当前输入框。通过实际 inset、容器布局和键盘状态预留空间，不用固定设备尺寸推算所有机型。[Apple Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- 优先采用平台标准导航、弹层和交互手势。自定义实现需要支持系统返回、键盘焦点和屏幕阅读顺序；大字体或小屏下允许滚动和重新布局。

## 颜色角色与外观

下表记录当前浅色设计的参考值，不是 Apple 系统语义色的固定定义。用户确认的浅灰画布保持为本 App 的视觉基线；颜色是否可用仍取决于实际背景、透明度和文字尺寸。

| 角色 | 值 | 用途 |
| --- | --- | --- |
| foreground | `#0A0A0A` | 标题及主要文字 |
| muted-foreground | `#616161`；占位提示 `#6B6B6B` | 白色表面及浅灰画布上的次要文字和提示 |
| primary | `#171717` | 主要操作表面 |
| primary-foreground | `#FAFAFA` | 深色操作表面上的文字 |
| card / surface | `#FFFFFF` | 浅色内容卡片与控件表面 |
| screen | `#F2F2F7` | 当前浅色页面、安全区域和导航容器的统一底色 |
| muted / secondary | `#F5F5F5` | 低强调度辅助表面 |
| border / input | `#E5E5E5` | 分隔线和输入边框 |
| destructive | `#B42318` | 浅色背景上可读的错误及破坏性反馈语义色 |
| selection-blue | `#005CB8` | 浅色选中状态参考色；按实际表面核验对比度 |

CSS 的旧 `background` token 仍被部分控件使用，不应将它与页面画布 `SCREEN_BACKGROUND` 混为一谈。原生 TabBar 优先让系统处理颜色适配；黑色主操作、蓝色选中状态属于本 App 配色选择，Apple 并不要求全部主要操作使用蓝色。

页面底色统一引用 `src/constants/colors.ts` 的 `SCREEN_BACKGROUND`，不叠加装饰圆形或光影背景。`GlassScreen`、独立页面和导航容器使用相同底色；原生根视图与启动背景在 `app.json` 中同步设置。

### 对比度与深色适配

- 对自定义文字采用保守的项目验收标准：普通文字至少 4.5:1；确认属于大号文字时才采用至少 3:1（WCAG 定义为至少 18pt，或至少 14pt 的粗体）。`Semibold` 不自动视为满足粗体例外，不能因文字“次要”或是占位提示就任意降低对比度。[WCAG 对比度说明](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- 对比度按最终合成背景计算。`#737373` 对白色约为 4.74:1，对 `#F2F2F7` 约为 4.25:1，不能在所有表面通用；`#A3A3A3` 对白色约为 2.52:1，不适合承载普通可读提示。以上是按不透明 sRGB 色值计算的静态结果，玻璃、照片和透明表面需另行测量。
- 优先采用系统语义色；自定义颜色准备浅色、深色及增强对比度变体，图标、选中状态和错误同时提供形状或文案线索。[Apple Color](https://developer.apple.com/design/human-interface-guidelines/color)
- 当前采用已确认的浅色画布，`app.json` 和根 Provider 统一为 `light`，主题辅助组件也使用同一外观，避免跟随系统深色时出现浅底白字。这是单一外观实现，不应标为“已适配深色模式”。未来支持深色时需要同时调整画布、表面、文字、状态栏及材质；单一外观下也要验证系统不同外观中的玻璃控件可读性。

## 材质与无障碍反馈

- Liquid Glass 用于浮在内容上方的重要功能层，如系统导航和悬浮录音控制；内容卡片、表单、列表和空状态使用实色表面或适合内容层的标准材质。内容可点击，不代表整张内容卡片都应该使用 Liquid Glass。[Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- 原生支持时优先采用系统材质；自定义功能层玻璃可复用 `GlassSurface`，但不嵌套堆叠或为所有组件统一加玻璃、描边和阴影。当前浅色工具页使用 `regular`；不为浅灰空白画布添加 `clear` 玻璃装饰。
- 遵守“降低透明度”和“增强对比度”，不支持材质的平台提供可读的实色回退。尊重“减少动态效果”，避免必须依赖大幅位移、视差或反复闪动才能理解状态。[Apple Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- VoiceOver 能读出名称、角色、当前状态和必要提示；装饰隐藏，组合控件避免重复朗读。录音计时和波形不连续打断朗读，开始、暂停、保存和错误通过可感知反馈传达；音频或颜色不作为唯一信息通道。[Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## 当前实现差距与验收

以下是本次文档核对发现的实现状态，后续修改代码时逐项验证，不能因规范已更新而标记完成：

| 项目 | 当前状态 | 验收要求 |
| --- | --- | --- |
| 字体与输入框 | 使用共享字体和动态输入框高度；大字体下验证码按钮、话题、日期列和素材网格重新布局 | 检查默认、200% 和最大辅助功能字号，覆盖中文、数字、长文本和键盘 |
| 内容层材质 | 内容卡片和表单使用 `ContentSurface` / `ContentPressable`，玻璃保留在导航及悬浮录音控制 | 核对 iOS 原生材质、层次与滚动遮挡 |
| 外观与增强对比度 | 页面统一为浅色；增强对比度或降低透明度时，自定义玻璃回退为实色 | 验证系统设置变化及原生控件外观；完整深色主题尚未启用 |
| 文字对比度 | 次要文字、占位符、错误色和选中色已加深；素材文件名增加深色遮罩 | 核验实际合成背景、按下和禁用状态，以及照片上的文字 |
| 交互区域 | 返回、验证码操作、协议入口和共享按钮的常规目标至少 44pt；素材删除按钮外层为 44 × 44pt | 在真机核对最终命中区域、相邻目标及父容器裁剪 |
| 弹层与无障碍 | 编辑弹窗避让键盘并允许滚动；录音与日期弹层使用安全区域，响应减少动态效果；已补充部分角色和名称 | 逐页验证 VoiceOver、粗体文本、最大字号、键盘和安全区域；尚未完成原生验收 |

验收同时覆盖小屏、长内容、加载、错误、禁用、空状态，以及悬浮控件遮挡。iOS 原生视觉和操作检查、Web 检查、静态代码检查分别记录；lint / typecheck 通过也不能替代设计验收。

## 组件与维护

- gluestack UI 提供交互与组件结构，App 显式设置字体与颜色；安装核心包不会自动获得 Apple 字体层级。
- 页面不得通过修改业务数据、隐藏错误说明或关闭无障碍缩放来适配字号。
- 新增文字先选语义层级。需要新层级时先更新 `src/constants/typography.ts` 和本文，再调整调用方。
- 修改页面后运行 `npx expo lint`、`npx tsc --noEmit`。布局变化还应查看渲染结果，明确区分 Web 检查与原生检查。

## 官方参考

- [Apple Typography：字体层级与动态文字](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple Accessibility：交互目标、对比度与辅助功能](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple Color：语义色与外观适配](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple Materials：内容层与 Liquid Glass 功能层](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple Text fields：输入与字段标签](https://developer.apple.com/design/human-interface-guidelines/text-fields)
- [Apple Buttons：操作反馈](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Apple Layout：布局与安全区域](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple Tab bars：顶层导航](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Apple Alerts：中断式提示与重要确认](https://developer.apple.com/design/human-interface-guidelines/alerts)
- [Apple Motion：动画与可替代反馈](https://developer.apple.com/design/human-interface-guidelines/motion)
- [WCAG 2.2 对比度说明：项目采用的文字对比度基线](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [React Native Text：字体缩放与 dynamicTypeRamp](https://reactnative.dev/docs/text)
- [React Native TextInput：输入文字缩放](https://reactnative.dev/docs/textinput)
- [NativeWind v5 单位说明](https://www.nativewind.dev/v5/core-concepts/units)
- [gluestack UI v5 安装与样式引擎](https://v5.gluestack.io/ui/docs/home/getting-started/installation)
