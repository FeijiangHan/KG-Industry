import './index.css'
import { Menu, Tooltip } from 'antd'
import { observer } from 'mobx-react-lite'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useStore from '@/store'
import MenuSetting from '@/pages/MenuSetting'
function Header () {
  const { publicStore } = useStore()
  const { kgGraphName3 } = publicStore
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [name, setName] = useState()
  const [menuKeys, setMenuKeys] = useState(['/'])
  const menuClick = (obj) => {
    setMenuKeys(obj.keyPath)
    nav(obj.keyPath[0], { replace: true })
  }
  useEffect(() => {
    setMenuKeys(pathname)
  }, [pathname])

  // useEffect(() => {
  //   setName(kgGraphName)
  // }, [kgGraphName])

  const menuStyle = {
    height: "64px",
    lineHeight: "64px"
  }
  const menuItems = [
    { label: '知识图谱交互管理', key: '/' }, // 菜单项务必填写 key
    { label: '本体/实体交互歧义性审查', key: '/AmbiguityReview' },
    { label: '关联关系交互式不确定性审查', key: '/UncertaintyReview' },
    { label: '多图谱协同交互式审查', key: '/MulKgFusion' },
  ]

  return (
    <div className="header">
      <div className="menu-setting">
        <MenuSetting />
      </div>
      <div className="menu">
        <Menu style={menuStyle} items={menuItems} mode="horizontal"
          selectedKeys={menuKeys} onClick={menuClick} />
      </div>
      <div className='graphName'>
        {/* 导入图谱后更新图谱名称 */}

        {localStorage.getItem("kgName") ?
          <>
            {localStorage.getItem("kgName").length <= 9 ?
              <>{localStorage.getItem("kgName")}</> :
              <Tooltip title={localStorage.getItem("kgName")}>
                {localStorage.getItem("kgName").substring(0, 9)}...
              </Tooltip>

            }
            {/* <Tooltip title={localStorage.getItem("kgName")}>
              {localStorage.getItem("kgName").substring(0, 9)}
            </Tooltip> */}

          </> : <></>

        }



        {/* {
          localStorage.getItem("kgIsMerge") === 'true' ?
            <>{localStorage.getItem("kgFileName3")}</>
            : <>
              <Tooltip title={localStorage.getItem("kgFileName1")}>
                {localStorage.getItem("kgFileName1") !== '' && localStorage.getItem("kgFileName1") ?
                  <> {localStorage.getItem("kgFileName1").substring(0, 7)}</> : <></>

                }

              </Tooltip>
            </>
        } */}
      </div>
      <div className="logo">
        <span>数据可视审查系统</span>
      </div>
    </div >

  )
}
export default observer(Header)