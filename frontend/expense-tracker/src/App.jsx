import Home from './pages/Home/Home'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Transaction from './pages/Transaction/Transaction'
import CreateTransaction from './pages/Transaction/CreateTransaction'

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoute />} >
            <Route path="/" element={<Home />} exact />
            <Route path="/transaction" element={<Transaction />} exact />
            <Route path="/transaction/create" element={<CreateTransaction />} exact />
            <Route path="/transaction/edit" element={<CreateTransaction isUpdate={true}/>} exact />
            <Route path="/transaction/view" element={<CreateTransaction showData={true} />} exact />
        </Route>
        <Route element={<LoginRoutes />} >
          <Route path="/login" element={<Login />} exact />
          <Route path="/signup" element={<Signup />}  exact />
        </Route>
      </Routes>
    </Router>
  )
}

const PrivateRoute = () => {
  let token = localStorage.getItem('token');
  return (
    token ? <Outlet /> : <Navigate to="/login" />
  )
}

const LoginRoutes  = () => {
  let token = localStorage.getItem('token');
  return (
    token ? <Navigate to="/transaction" /> : <Outlet />
  )
}

const App = () => {
  return (
    <div>
      <AppRoutes />
    </div>
  )
}

export default App