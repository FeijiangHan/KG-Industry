## Graph 图组件属性

### 图谱基础样式

- initNodeSet: 选填 是一个对象,需要覆盖哪个初始就填哪个 key-value,具体参考 Graph 下 config.js
- initLinkSet: 选填
- initLayoutSet: 选填

### 基本属性

- data: 必填

```
{
  nodes: [],
  links:[],
}
```

- loading: 必填 是否启动加载界面,与 data 配合使用,当 data 为产生前设置为 true,产生后设置为 false
- setLoading: 必填

```
const [loading,setLoading] = useState(falsse)
```

- editDisable: 是否禁止图编辑功能 默认为 false
- remoteAcqu: 详细信息是否从后端获取 默认为 true
- 只有 editDisable 和 remoteAcqu 都为 true 才能増删改

### 地图配合属性

- mapSelectId: 节点 id,传递给该 id 时，节点高亮
- getLocationFlag: 増修节点时,是否与地图联动获取地理信息
- setGetLocationFlag: 和 getLocationFlag 是一对
- location: 地图获取到的地理信息

## 启动问题

1. npm install
2. npm start
3. craco.config.js 中修改后端路径
4. public-index.html 中修改地图资源路径
