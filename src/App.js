import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './Auth';
import ClientDashboard from './components/client/ClientDashboard';
import ClientHome from './components/client/ClientHome';
import ClientAbout from './components/client/ClientAbout';
import ClientMenu from './components/client/ClientMenu';
import ClientCart from './components/client/ClientCart';
import ClientProfile from './components/client/ClientProfile';
import ClientServices from './components/client/ClientServices';
import ClientMessages from './components/client/ClientMessages';
import { EmailProvider } from './components/EmailContext';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import AdminOrders from './components/admin/AdminOrders';
import AdminItemList from './components/admin/AdminItemList';
import AdminMessages from './components/admin/AdminMessages';
import AdminSettings from './components/admin/AdminSettings';
import AdminClients from './components/admin/AdminClients';
import AdminAppointments from './components/admin/AdminAppointments';
import AdminAnalytics from './components/admin/AdminAnalytics';
import LandingPage from './components/LandingPage';
import SuperAdmin from './components/superadmin/SuperAdmin';
import ErrorPage from './components/ErrorPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <EmailProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path='/' element={<LandingPage/>}/>
            
            <Route path="/dashboard-client" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="home" />} />
              <Route path="home" element={<ClientHome />} />
              <Route path="about" element={<ClientAbout />} />
              <Route path="menu" element={<ClientMenu />} />
              <Route path="cart" element={<ClientCart />} />
              <Route path="settings" element={<ClientProfile />} />
              <Route path="services" element={<ClientServices />} />
              <Route path="messages" element={<ClientMessages />} />
            </Route>
            
            <Route path='/dashboard-admin/home' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/settings' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/orders' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrders/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/itemlists' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminItemList/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/profile' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfile/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/clients' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClients/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/messages' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMessages/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/appointments' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAppointments/>
              </ProtectedRoute>
            } />
            <Route path='/dashboard-admin/analytics' element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalytics/>
              </ProtectedRoute>
            } />
            <Route path="*" element={<ErrorPage />} />
            <Route path='/super-admin' element={<SuperAdmin/>}>
            </Route>
          </Routes>
          
        </Router>
      </EmailProvider>
    </GoogleOAuthProvider>
  );
};

export default App;