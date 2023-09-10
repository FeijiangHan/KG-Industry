import './index.css'
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import { useEffect } from 'react'
import useStore from '@/store'
import Pattern from '../../GraphCompoments/Pattern'
function Layout () {
  const { publicStore } = useStore()
  useEffect(() => {
    window.onresize = () => {
      publicStore.onWindowResizeFlag()
    }
    return () => {
      window.onresize = null
    }
  }, [publicStore])
  return (
    <div className='layout'>
      <Header></Header>
      <Pattern></Pattern>
      <div className='remain'>
        <Outlet></Outlet>
      </div>
    </div>
  )
}
export default Layout