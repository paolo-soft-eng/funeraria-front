import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { EmailProvider } from './components/utils/EmailContext';
import LoadingScreen from './components/LoadingScreen';
import LoadingWrapper from './components/LoadingWrapper';
import ProtectedRoute from './components/utils/ProtectedRoute';
import ClientPackageCart from './components/client/ClientPackageCart';
import ClientActiveOrders from './components/client/ClientActiveOrders';
import ClientOrderHistory from './components/client/ClientOrderHistory';

const ClientAppointment = lazy(() => import('./components/client/ClientAppointment'));
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
const ForgotPassword = lazy(() => import('./components/utils/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/utils/ResetPassword'));
const PaymentSuccess = lazy(() => import('./components/utils/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./components/utils/PaymentFailed'));
const OurStory = lazy(()=> import('./components/OurStory'));
const ContactSupport = lazy(()=> import('./components/ContactSupport'));
const PrivacyPolicy = lazy(()=> import('./components/PrivacyPolicy'));
const TermOfService = lazy(()=> import('./components/TermOfService'));

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <EmailProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/gomez/auth" element={
                <LoadingWrapper>
                  <Auth />
                </LoadingWrapper>
              } />
              <Route path='/' element={
                <LoadingWrapper>
                  <LandingPage/>
                </LoadingWrapper>
              }/>
              <Route path='/gomez/story' element={
                <LoadingWrapper>
                  <OurStory/>
                </LoadingWrapper>
              }/>
              <Route path='/gomez/contact-support' element={
                <LoadingWrapper>
                  <ContactSupport/>
                </LoadingWrapper>
              }/>
              <Route path='/gomez/privacy-policy' element={
                <LoadingWrapper>
                  <PrivacyPolicy/>
                </LoadingWrapper>
              }/>
              <Route path='/gomez/term-of-service' element={
                <LoadingWrapper>
                  <TermOfService/>
                </LoadingWrapper>
              }/>
              <Route path="/gomez/forgot-password" element={
                <LoadingWrapper>
                  <ForgotPassword />
                </LoadingWrapper>
              } />
              <Route path="/gomez/reset-password" element={
                <LoadingWrapper>
                  <ResetPassword />
                </LoadingWrapper>
              } />
              <Route path="/gomez/payment-success" element={
                <LoadingWrapper>
                  <PaymentSuccess />
                </LoadingWrapper>
              } />
              <Route path="/gomez/payment-failed" element={
                <LoadingWrapper>
                  <PaymentFailed />
                </LoadingWrapper>
              } />

              <Route path="/gomez/dashboard-client" element={
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
                <Route path="funeral-cart" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientPackageCart />
                  </Suspense>
                } />
                <Route path="active-orders" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientActiveOrders />
                  </Suspense>
                } />
                <Route path="order-history" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientOrderHistory />
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

              <Route path='/gomez/dashboard-admin/home' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminDashboard/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/settings' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminSettings/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/orders' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminOrders/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/itemlists' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminItemList/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/clients' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminClients/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/messages' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminMessages/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/appointments' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminAppointments/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/analytics' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminAnalytics/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/reports' element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<LoadingScreen />}>
                    <LoadingWrapper>
                      <AdminReport/>
                    </LoadingWrapper>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path='/gomez/dashboard-admin/documents' element={
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
              <Route path='/gomez/super-admin' element={
                <Suspense fallback={<LoadingScreen />}>
                  <LoadingWrapper>
                    <SuperAdmin/>
                  </LoadingWrapper>
                </Suspense>
              } />
              <Route path='/gomez/super-admin/reports' element={
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
