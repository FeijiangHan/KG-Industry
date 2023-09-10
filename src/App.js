import { unstable_HistoryRouter as Router, Routes, Route } from 'react-router-dom'
import { history } from '@/utils'
import KgManger from '@/pages/KgManger'
import AmbiguityReview from '@/pages/AmbiguityReview'
import UncertaintyReview from '@/pages/UncertaintyReview'
import MulKgFusion from '@/pages/MulKgFusion'
import Layout from './pages/Layout'
function App () {
  return (
    <div className="App">
      <Router history={history}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<KgManger />}></Route>
            <Route path="/AmbiguityReview" element={<AmbiguityReview />}></Route>
            <Route path="/UncertaintyReview" element={<UncertaintyReview />}></Route>
            <Route path="/MulKgFusion" element={<MulKgFusion />}></Route>
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
