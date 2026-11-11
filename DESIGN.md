# gluestack UI 设计系统

## gluestack UI 设计系统界面预览

添加一个唯一条目，将其标记为已打包，并查看计算得出的进度。

## gluestack UI 设计系统设计参考

此参考将文档中记录的 v5 浅色配色与已安装的核心创建器 API 区分开来。直接使用创建器不会自动应用 CLI 主题。预览会将所列颜色明确映射到原创样式，并使用更醒目的自定义焦点轮廓。几何样式和插图均为应用层面的选择。

### 文档记录的 v5 浅色角色

| 名称 / 规则 | 值 / 配置 | 用途 |
| --- | --- | --- |
| background | #ffffff | 页面画布。 |
| foreground | #0a0a0a | 常规可读文本。 |
| card | #ffffff | 卡片表面。 |
| popover | #ffffff | 叠加表面；本示例未使用弹出层。 |
| popover-foreground | #0a0a0a | 与叠加表面搭配的文本。 |
| muted | #f5f5f5 | 辅助表面，包括原创插图面板。 |
| muted-foreground | #737373 | 次要描述和状态详情。 |
| destructive | #e7000b | 无效输入反馈；错误也会以文本显示。 |
| border | #e5e5e5 | 卡片轮廓和列表分隔线。 |
| input | #e5e5e5 | 字段默认边框。 |
| ring | #d4d4d4 | 文档记录的默认焦点环颜色；本示例使用更醒目的原创 #737373 焦点轮廓。 |
| primary | #171717 | 主要操作表面和进度填充色。 |
| primary-foreground | #fafafa | 与深色操作表面搭配的文本。 |
| secondary | #f5f5f5 | 较低强调度的操作表面。 |
| secondary-foreground | #171717 | 与辅助表面搭配的文本。 |
| accent | #f7f7f7 | 附加的强调色表面角色。 |
| accent-foreground | #343434 | 与强调色角色搭配的文本。 |
### 核心 Button 工厂与状态

| 名称 / 规则 | 值 / 配置 | 用途 |
| --- | --- | --- |
| createButton | { Root, Text, Group, Spinner, Icon } | 提供实际的宿主组件；创建器负责添加行为，而非完整主题。 |
| Button.Text | Text host | 在状态上下文中保留按钮文本。 |
| Button.Group | Group host | 用于组合按钮的生成子组件；此布局未使用。 |
| Button.Spinner | Spinner host | 生成的加载提示；对于即时完成的本地操作，不应显示。 |
| Button.Icon | Icon host | 生成的图标子组件；预览使用显式文本操作。 |
| Button isDisabled | boolean | 禁用实际的按压行为，而不仅仅改变外观。 |
| Button data-focus-visible | true / false | 原创的 CSS 会为键盘焦点应用可见轮廓。 |
| Button data-active | true / false | 向样式暴露按压交互状态。 |
### 核心 Input 上下文与宿主属性

| 名称 / 规则 | 值 / 配置 | 用途 |
| --- | --- | --- |
| createInput | { Root, Icon, Slot, Input } | 创建字段上下文及相关插槽。 |
| Input.Input | TextInput host | 创建器返回的文本输入组件。 |
| isInvalid | Input root boolean | 将无效状态上下文和 aria-invalid 传递给字段。 |
| isRequired | Input root boolean | 传递必填状态；应用仍会自行执行去除首尾空格的验证。 |
| value / onChangeText | Controlled TextInput props | 在 React 状态中保留草稿文本。 |
| onSubmitEditing | TextInput callback | 在此浏览器示例中，按 Enter 键可添加条目。 |
| maxLength | 60 in the original study | 为此应用选择的 TextInput 长度限制，并非 gluestack 默认值。 |
| aria-label | Item name in the original study | 为输入框命名，并同时提供可见标签。 |
## gluestack UI 设计系统完整指南

实用指南，介绍如何为真实界面选择、应用和评审此系统。

完整指导、实现起点和源代码链接。

## gluestack UI 设计系统版本、创建器与生成的组件

### 选择实际的实现方式

> gluestack 有多个层级。标准安装流程会在应用中生成带样式的组件。此示例则从已安装的核心包导入 createButton 和 createInput，并提供 React Native Web 宿主组件。区分两者很重要：仅安装核心包并不会提供生成的按钮变体或完整主题。

此运行示例固定使用 core 5.0.15 和 utils 5.0.6。它的 React Native Web 适配器是真实组件，而外壳和状态逻辑则是自行编写的。构建完整的 Expo 或 Next.js 应用时，请参阅安装文档；要复现这个特定的浏览器研究示例，请使用此处的完整文件。

## gluestack UI 设计系统的语义颜色与显式样式

### 先定义角色，再选择装饰

页面采用白色画布、深色主操作、低调的辅助区域，并清晰呈现边框的角色。这些值取自文档中 v5 的浅色配色，然后通过 React Native 样式和普通的 CSS 显式指定。运行时没有任何 Provider 在暗中应用这些样式。

无效字段会同时显示破坏性颜色的轮廓、易读的说明，并将焦点移回字段。原示例中的焦点轮廓比文档所述的默认环更深，因此样式表会注明这是一个自定义选择，而非库的设计令牌。

### 谨慎进行迁移

使用数字命名调色板的旧示例，不应与 v5 的语义词汇盲目混用。替换令牌名称前，请检查已安装的生成配置和升级指南。直接研究 creator 可以演示其行为，但不能证明完整的应用迁移已经完成。

## gluestack UI 设计系统中的按钮组合与键盘操作

### 为 creator 提供所有宿主组件

createButton 接收 Pressable、Text、View、ActivityIndicator 和图标宿主组件，并返回 Button 以及 Text、Group、Spinner 和 Icon 子组件。完整示例使用 Button.Text，而不是将纯字符串直接放入 pressable 根元素中。

打包是同步的状态转换，因此不会伪造加载指示器或保存延迟。每个操作的可访问标签中都包含物品名称。可见操作会在“打包物品”和“取消打包”之间切换，让用户清楚了解下一步操作的效果。

### 验证渲染后的行为

1. 使用 Tab 键移至“打包物品”操作，然后按空格键。

2. 确认已打包状态的文字和进度值都发生变化。

3. 使用“取消打包”，并确认同一物品仍留在列表中。

4. 检查焦点轮廓，不要仅凭鼠标悬停就认定键盘支持正常。

## gluestack UI 设计系统中的输入上下文与完整验证

### 验证即将存储的值

输入值通过 value 和 onChangeText 保持受控。点击“添加”后，程序会先去除草稿首尾空格，拒绝空值，再以不区分大小写的方式比较名称。若值被拒绝，字段会保留该值，供用户修改。

根元素接收 isInvalid 和 isRequired；实际输入字段接收标签、说明的引用，以及用于恢复焦点的 ref。验证属于应用逻辑：将核心输入设为必填，并不会自动生成重复名称校验规则。

### 处理每一种可见的字段状态

- 初始状态：字段为空，且显示长度提示。

- 无效状态：警告中显示说明，字段获得焦点。

- 编辑状态：用户修改草稿时，旧错误文本会清除。

- 已接受状态：新增一行未打包的物品，字段清空，状态消息会说明已添加的内容。

## gluestack UI 设计系统中的稳定标识与派生进度

### 存储物品，派生摘要

每件物品都有稳定的数字 id、名称和打包标记。新 id 由 ref 提供；显示的名称不会用作 React key。切换状态时按 id 映射，因此两个无关的 UI 更新不会意外更改另一行。

进度分子根据已打包标记计算，分母则取当前列表的物品数量。添加一件未打包的物品后，百分比可能下降，但已打包的物品不会丢失。这是清单变长后应有的结果，并非动画错误。

### 将重置作为明确的本地操作

重置操作会恢复三件示例物品、清空草稿和错误信息、重置下一个 id，并播报操作结果。重新加载页面也会回到示例初始状态。此预览不涉及服务器、账户同步或持久化存储。

## gluestack UI 设计系统中的响应式布局与原创插画

### 区分宿主行为与页面布局

桌面布局将清单和输入面板并排放置；视口宽度为 700 像素时，布局变为单列。必要时，行内容会换行，较长的物品名称也会在可用空间内断行；固定宽度的操作按钮不应导致整个文档横向溢出。

笔记本和铅笔是原创的 CSS 图形，并非复制自 gluestack 品牌素材。卡片的 14 像素圆角、面板之间的 24 像素间距和标题字号层级，都是本示例的设计选择。参考表会将这些内容与文档所述的颜色角色分开列出。

## gluestack UI 设计系统中的浏览器无障碍支持与平台范围

### 针对实际呈现的环境进行测试

此预览通过浏览器渲染 React Native Web，并已在浏览器中完成检查。它不能证明原生 iOS 或 Android 上的行为。Expo 应用还必须单独验证触控目标、屏幕阅读器播报、键盘避让和平台导航。

进度元素包含名称、最小值、最大值和当前值。实时状态会描述已完成的操作，同时不会让读屏用户偏离清单。表单在拒绝输入后会保留草稿，并将焦点移回字段。这些都是构建在原生核心行为之上的应用职责。

## gluestack UI 设计系统的完整构建与依赖边界

### 复现此研究示例

将 Component Examples 中的全部四个文件保存到同一目录，并安装下方列出的固定版本软件包。构建配置会将 react-native 别名指向 react-native-web，因为 core 内部会按原生模块名称导入依赖。源代码直接导入浏览器宿主组件，不会加载 Expo 运行时。

这个仅用于 Web 的精简软件包安装会使用 legacy peer resolution。对于完整的原生应用，这并非推荐做法：完整库声明了原生、SVG 和 safe-area 集成的对等依赖，而这个只用到两个 creator 的软件包并未使用这些集成。扩展组件集时，请添加相应的对等依赖。

### 每次只更改一个层面

1. 构建未更改的文件，并验证添加、拒绝重复项、打包和重置功能。

2. 更改原始布局或应用内容，同时保留创建器的接线方式。

3. 如果采用生成的 NativeWind 组件，请将样式和 provider 配置作为单独的集成步骤进行替换。

4. 完成更改后，重新检查键盘行为以及实际目标平台。

## gluestack UI 设计系统组件示例

### app.jsx — 完整的核心组件研究示例

实际的创建器接线方式和完整的清单状态模型。

```
import React,{useState,useRef} from 'react';
import{createRoot}from'react-dom/client';
import{Pressable,Text,View,TextInput,ActivityIndicator}from'react-native-web';
import{createButton}from'@gluestack-ui/core/button/creator';
import{createInput}from'@gluestack-ui/core/input/creator';
const Button=createButton({Root:Pressable,Text,Group:View,Spinner:ActivityIndicator,Icon:View});
const Input=createInput({Root:View,Input:TextInput,Slot:Pressable,Icon:View});
const seed=[{id:1,name:'Sketchbook',packed:true},{id:2,name:'Pencil roll',packed:false},{id:3,name:'Water bottle',packed:false}];
function App(){const[items,setItems]=useState(seed),[name,setName]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('Pack each item when it is ready.');const next=useRef(4),field=useRef(null);const count=items.filter(x=>x.packed).length;
function add(){const v=name.trim();if(!v||items.some(x=>x.name.toLowerCase()===v.toLowerCase())){setError(!v?'Enter the name of an item.':'That item is already in the kit.');field.current.focus();return}setItems([...items,{id:next.current++,name:v,packed:false}]);setName('');setError('');setMessage(v+' added to this local kit.')}
return <main><header><p className="eyebrow">GLUESTACK UI / CORE COMPONENT STUDY</p><h1>A small kit.<br/>A clearer start.</h1><p className="intro">Prepare a drawing kit with actual gluestack core Button and Input creators. Your checklist stays in this browser session.</p></header><div className="layout"><section className="panel"><div className="sectionhead"><h2>Your field kit</h2><span className="badge">{count} of {items.length} packed</span></div><div className="meter" role="progressbar" aria-label="Packed items" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={count}><i style={{width:100*count/items.length+'%'}}/></div><ul>{items.map(item=><li key={item.id}><div><strong>{item.name}</strong><span>{item.packed?'Packed and ready':'Still to pack'}</span></div><Button onPress={()=>{setItems(items.map(x=>x.id===item.id?{...x,packed:!x.packed}:x));setMessage(item.name+(item.packed?' marked to pack.':' marked packed.'))}} style={item.packed?styles.secondary:styles.primary} aria-label={(item.packed?'Unpack ':'Pack ')+item.name}><Button.Text style={{color:item.packed?'#171717':'#fafafa',fontSize:14,fontWeight:600}}>{item.packed?'Unpack':'Pack item'}</Button.Text></Button></li>)}</ul><p className="status" role="status">{message}</p></section><aside className="panel"><div className="drawing" aria-hidden="true"><span className="book">FIELD<br/>NOTES</span><i className="pencil"/></div><h2>Add one useful thing</h2><label htmlFor="kit-name">Item name</label><Input isInvalid={!!error} isRequired style={styles.input}><Input.Input id="kit-name" aria-label="Item name" aria-describedby={error?'kit-error':'kit-hint'} ref={field} value={name} onChangeText={v=>{setName(v);setError('')}} onSubmitEditing={add} maxLength={60} style={styles.field}/></Input><p id="kit-hint" className="hint">Use a short, unique name. Maximum 60 characters.</p>{error&&<p id="kit-error" className="error" role="alert">{error}</p>}<Button onPress={add} style={styles.primary}><Button.Text style={styles.primaryText}>Add to kit</Button.Text></Button><Button onPress={()=>{setItems(seed);setName('');setError('');setMessage('Example kit restored.');next.current=4}} style={styles.reset}><Button.Text style={{color:'#737373',fontSize:14}}>Reset example kit</Button.Text></Button></aside></div><p className="scope">Native @gluestack-ui/core 5.0.15 behavior rendered through React Native Web. Original OpenDesign layout and artwork; explicitly styled with documented v5 light color roles. This is a web-only study, not an Expo build or the CLI-generated NativeWind component set.</p></main>}
const styles={primary:{backgroundColor:'#171717',paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center',justifyContent:'center'},secondary:{backgroundColor:'#f5f5f5',paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center',justifyContent:'center'},primaryText:{color:'#fafafa',fontSize:14,fontWeight:600},input:{borderWidth:1,borderColor:'#e5e5e5',borderRadius:8,marginTop:8},field:{padding:12,fontSize:16,color:'#0a0a0a',outlineStyle:'none'},reset:{paddingVertical:16,alignItems:'center'}};
createRoot(document.getElementById('app')).render(<App/>);
```

代码参考

### style.css — 原始布局和明确的浅色角色

完整的响应式框架、插图、状态轮廓和浏览器焦点样式。

```
*{box-sizing:border-box}body{margin:0;background:#fff;color:#0a0a0a;font-family:Arial,sans-serif}main{max-width:1100px;margin:auto;padding:40px}.eyebrow{font-size:12px;letter-spacing:.12em;font-weight:700}.intro{max-width:62ch;color:#737373;line-height:1.6}h1{font-size:52px;line-height:1.03;letter-spacing:-.045em;margin:24px 0}h2{font-size:22px;margin:0 0 20px}.layout{display:grid;grid-template-columns:1.35fr 1fr;gap:24px;margin-top:32px}.panel{border:1px solid #e5e5e5;border-radius:14px;padding:24px;min-width:0}.sectionhead{display:flex;gap:12px;justify-content:space-between;align-items:baseline;flex-wrap:wrap}.badge{font-size:12px;background:#f5f5f5;padding:6px 10px;border-radius:20px}.meter{height:6px;border-radius:8px;background:#f5f5f5;margin:6px 0 24px;overflow:hidden}.meter i{display:block;height:100%;background:#171717}ul{list-style:none;padding:0;margin:0}li{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid #e5e5e5}li>div:first-child{min-width:0;flex:1}li strong{display:block;font-size:16px;overflow-wrap:anywhere}li span{display:block;font-size:13px;color:#737373;margin-top:8px}.status{font-size:14px;line-height:1.6;margin-top:24px}.hint,.scope{font-size:12px;line-height:1.6;color:#737373}.scope{margin-top:28px}.error{font-size:14px;color:#e7000b;line-height:1.5}label{font-size:14px}.drawing{height:130px;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:24px}.book{display:block;background:#171717;color:#fafafa;border-left:5px solid #737373;width:80px;height:96px;padding:22px 12px;font-size:12px;line-height:1.6;transform:rotate(-8deg)}.pencil{height:90px;width:8px;background:#a3a3a3;transform:rotate(14deg)}[data-focus-visible=true]{outline:3px solid #737373;outline-offset:3px}[data-invalid=true]{border-color:#e7000b!important}input:focus-visible{outline:2px solid #737373!important;outline-offset:3px}@media(max-width:700px){main{padding:20px}h1{font-size:40px}.layout{grid-template-columns:1fr}.panel{padding:20px}li{gap:12px;flex-wrap:wrap}li>div:first-child{flex-basis:120px}}
```

代码参考

### build.mjs — 完整的 Web 打包器配置

即使 app.jsx 从 React Native Web 导入宿主组件，也必须配置原生导入别名。

```
import { build } from 'esbuild';
await build({entryPoints:['app.jsx'],bundle:true,minify:true,outfile:'app.js',alias:{'react-native':'react-native-web'},resolveExtensions:['.web.js','.js','.jsx','.ts','.tsx','.json'],loader:{'.js':'jsx'},define:{'process.env.NODE_ENV':'"production"'}});
```

代码参考

### index.html — 完整的浏览器入口文件

将此文件与 style.css 和生成的 app.js 放在同一目录。

```
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>gluestack field kit</title><link rel="stylesheet" href="style.css"></head><body><div id="app"></div><script src="app.js"></script></body></html>
```

代码参考

## gluestack UI 设计系统 Agent 设置

### 实现起点

先保存这四个完整文件。本设置仅适用于演示的浏览器功能子集，不会初始化 NativeWind、Uniwind、Expo 或生成的组件注册表。

```
npm init -y
npm install react@19.3.0 react-dom@19.3.0 react-native-web@0.21.3 @gluestack-ui/core@5.0.15 @gluestack-ui/utils@5.0.6 esbuild@0.28.2 --legacy-peer-deps
node build.mjs
python3 -m http.server 8000
# Open http://localhost:8000/
```

### 适用于你项目的提示词

```
使用 createButton/createInput 和 React Native Web 宿主组件，实现完整的 gluestack core 5.0.15 field-kit 浏览器研究示例。保留稳定的 id、受控的草稿文本、去空格与重复项验证、焦点恢复、派生的已打包计数、本地重置和明确的 v5 浅色角色映射。将原始布局选择与库默认值分开。不要声称已进行原生移动端测试或支持后端持久化。
```

## gluestack UI 设计系统来源与范围

通过 React Native Web 0.21.3 展示实际的 @gluestack-ui/core 5.0.15 行为。field-kit 布局、插图和状态模型均为 OpenDesign 原创内容。此直接创建器浏览器示例使用显式样式；它不是 CLI 生成的 NativeWind/Uniwind 组件集，也未经 iOS 或 Android 测试。

- 安装 标准的生成组件安装路径。

- v5 语义令牌 当前浅色配色角色和自定义设置。

- 按钮 API 按钮结构、交互和状态属性。

- 核心 Button 工厂 已安装的 5.0.15 创建器的准确实现。

- 核心 Input 实现 受控字段、无效状态和无障碍接线。

- 升级到 v5 版本迁移和命名更改。

## gluestack UI 设计系统相关资源

### Headless UI

Headless UI 提供未设样式的 React 交互组件，适用于对话框、列表框和开关。本指南以文档共享流程为例，介绍如何将这些组件原生的焦点、选择和弹出行为与常规 CSS 组合使用。

### HeroUI

HeroUI v3 参考，包含实际的语义化 CSS 变量、复合 React 控件、明暗界面表面，以及可用的图像导出方法。

### Ionic Framework

原生 Ionic 阅读偏好设置界面，包含经过验证的配色角色、iOS 和 Material 范围滑块的几何样式、真实的分段控件与开关行为，以及可根据字体、字号和纸张选项调整的文章。


- [实现参考](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)
- [来源](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens)
- [来源](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)
- [来源](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/input/creator/Input.jsx)
- [代码参考](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)
- [代码参考](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens)
- [代码参考](https://github.com/gluestack/gluestack-ui)
- [安装 标准的生成组件安装路径。](https://gluestack.io/ui/docs/home/getting-started/installation)
- [v5 语义令牌 当前浅色配色角色和自定义设置。](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens)
- [按钮 API 按钮结构、交互和状态属性。](https://gluestack.io/ui/docs/components/button)
- [核心 Button 工厂 已安装的 5.0.15 创建器的准确实现。](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)
- [核心 Input 实现 受控字段、无效状态和无障碍接线。](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/input/creator/Input.jsx)
- [升级到 v5 版本迁移和命名更改。](https://gluestack.io/ui/docs/guides/more/upgrade-to-v5)
