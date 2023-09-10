import './index.css'
import { Menu } from 'antd'
import useStore from '../../store'
import { useRef } from 'react'
function GraphContextMenu (props) {
  const {
    menuType,
    menuTransform,
    algorithmFlag,
    menuVisible, setMenuVisible,
    setMenuOperate
  } = props
  const cnt = useRef(0)
  const handleClick = (e) => {
    const operationType = "" + cnt.current + e.key
    if (++cnt.current >= 9) {
      cnt.current = 0
    }
    setMenuOperate(operationType)
    /*
    switch (e.key) {
      case 'addNode':
        generateOperation("addNode")
        break
      case 'upNode':
        generateOperation("upNode")
        break
      case 'delNode':
        generateOperation("delNode")
        break
      case 'addLink':
        generateOperation("addLink")
        break
      case 'upLink':
        generateOperation("upLink")
        break
      case 'delLink':
        generateOperation("delLink")
        break
      case 'useSimplifyEquiv':
        generateOperation('useSimplifyEquiv')
      case ''
      default:
        break
    }*/
    setMenuVisible(false)
  }
  const nodeMenu = [
    // { label: "添加节点", key: 'addNode' },
    { label: "修改节点", key: 'upNode', disabled: props.editDisabled },
    { label: "删除节点", key: 'delNode', disabled: props.editDisabled },

  ]
  const linkMenu = [
    // { label: "添加边", key: 'addLink' },
    { label: "修改关系", key: 'upLink', disabled: props.editDisabled },
    { label: "删除关系", key: 'delLink', disabled: props.editDisabled },
  ]
  const otherMenu = [
    { label: "添加节点", key: 'addNode', disabled: props.editDisabled },
    { label: "添加关系", key: 'addLink', disabled: props.editDisabled },
    { label: "等价结构化简", key: 'useSimplifyEquiv', disabled: algorithmFlag || props.isAlgorithm },
    { label: "等价结构提取", key: 'useEquivalentstructureExtraction', disabled: algorithmFlag || props.isAlgorithm },
    //useSuperpointextraction
    { label: "超点提取", key: 'useSuperpointextraction', disabled: algorithmFlag || props.isAlgorithm },
    //useEquivalentstructureExtraction
    //useBackboneExtraction
    { label: "骨干提取", key: 'useBackboneExtraction', disabled: algorithmFlag || props.isAlgorithm },
    { label: "层次剪枝", key: 'useHierarchicalPruning', disabled: algorithmFlag || props.isAlgorithm },
    { label: "树布局", key: 'useTreeLayout', disabled: algorithmFlag || props.isOntology },
  ]
  let menuItems = otherMenu
  if (menuType === 'node') {
    menuItems = nodeMenu
  } else if (menuType === 'link') {
    menuItems = linkMenu
  } else {
    menuItems = otherMenu
  }

  return (
    <div className="graph-context-menu" style={menuVisible ? { display: 'block', ...menuTransform } : { display: 'none' }}>
      <Menu className="menu-box" onClick={handleClick} selectable={false} items={menuItems} ></Menu>
    </div>
  )
}
export default GraphContextMenu