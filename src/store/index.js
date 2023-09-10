import { createContext, useContext } from "react"
import PublicStore from './public.store'
import GraphStore from './graph.store'
class RootStore {
  constructor() {
    this.publicStore = new PublicStore()
    this.graphStore = new GraphStore()
  }
}

const rootStore = new RootStore()
//createContext 可以通过<Provider value={}>来提供数据
//也可传入参数来提供
const context = createContext(rootStore)
//useContext首先会寻找最近的provider 若未找到则搜寻参数
//每次调用useStore来启用函数
const useStore = () => useContext(context)

export default useStore
