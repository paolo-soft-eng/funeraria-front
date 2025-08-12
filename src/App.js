import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { EmailProvider } from './components/EmailContext';
import LoadingScreen from './components/LoadingScreen';
import LoadingWrapper from './components/LoadingWrapper';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components for better performance
const Auth = lazy(() => import('./Auth'));
const ClientDashboard = lazy(() => import('./components/client/ClientDashboard'));
const ClientHome = lazy(() => import('./components/client/ClientHome'));
const ClientAbout = lazy(() => import('./components/client/ClientAbout'));
const ClientMenu = lazy(() => import('./components/client/ClientMenu'));
const ClientCart = lazy(() => import('./components/client/ClientCart'));
const ClientProfile = lazy(() => import('./components/client/ClientProfile'));
const ClientServices = lazy(() => import('./components/client/ClientServices'));
const ClientMessages = lazy(() => import('./components/client/ClientMessages'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./components/admin/AdminOrders'));
const AdminItemList = lazy(() => import('./components/admin/AdminItemList'));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));
const AdminClients = lazy(() => import('./components/admin/AdminClients'));
const AdminAppointments = lazy(() => import('./components/admin/AdminAppointments'));
const AdminAnalytics = lazy(() => import('./components/admin/AdminAnalytics'));
const AdminReport = lazy(() => import('./components/admin/AdminReport'));
const AdminDocuments = lazy(() => import('./components/admin/AdminDocuments'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const SuperAdmin = lazy(() => import('./components/superadmin/SuperAdmin'));
const SuperAdminReport = lazy(() => import('./components/superadmin/SuperAdminReport'));
const ErrorPage = lazy(() => import('./components/ErrorPage'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <EmailProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/auth" element={
                <LoadingWrapper>
                  <Auth />
                </LoadingWrapper>
              } />
              <Route path='/' element={
                <LoadingWrapper>
                  <LandingPage/>
                </LoadingWrapper>
              }/>
              <Route path="/forgot-password" element={
                <LoadingWrapper>
                  <ForgotPassword />
                </LoadingWrapper>
              } />
              <Route path="/reset-password" element={
                <LoadingWrapper>
                  <ResetPassword />
                </LoadingWrapper>
              } />

              <Route path="/dashboard-client" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientDashboard />
                  </Suspense>
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="home" />} />
                <Route path="home" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientHome />
                  </Suspense>
                } />
                <Route path="about" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientAbout />
                  </Suspense>
                } />
                <Route path="menu" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientMenu />
                  </Suspense>
                } />
                <Route path="cart" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientCart />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientProfile />
                  </Suspense>
                } />
                <Route path="services" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientServices />
                  </Suspense>
                } />
                <Route path="messages" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientMessages />
                  </Suspense>
                } />
              </Route>

              <Route path='/dashboard-admin/home' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminDashboard/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/settings' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminSettings/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/orders' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminOrders/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/itemlists' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminItemList/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/clients' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminClients/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/messages' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminMessages/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/appointments' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminAppointments/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/analytics' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminAnalytics/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/reports' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminReport/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/dashboard-admin/documents' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminDocuments/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <Suspense fallback={<LoadingScreen />}>
                  <LoadingWrapper>
                    <ErrorPage />
                  </LoadingWrapper>
                </Suspense>
              } />
              <Route path='/super-admin' element={
                <Suspense fallback={<LoadingScreen />}>
                  <LoadingWrapper>
                    <SuperAdmin/>
                  </LoadingWrapper>
                </Suspense>
              } />
              <Route path='/super-admin/reports' element={
                <Suspense fallback={<LoadingScreen />}>
                  <LoadingWrapper>
                    <SuperAdminReport/>
                  </LoadingWrapper>
                </Suspense>
              } />
            </Routes>
          </Suspense>
        </Router>
      </EmailProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
