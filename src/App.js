import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { EmailProvider } from './components/utils/EmailContext';
import LoadingScreen from './components/static/loading/LoadingScreen';
import LoadingWrapper from './components/static/loading/LoadingWrapper';
import ProtectedRoute from './components/utils/ProtectedRoute';
import ClientPackageCart from './components/pages/client/ClientPackageCart';
import ClientActiveOrders from './components/pages/client/ClientActiveOrders';
import ClientOrderHistory from './components/pages/client/ClientOrderHistory';
import ClientCustomized from './components/pages/client/ClientCustomized';

const ClientAppointment = lazy(() => import('./components/pages/client/ClientAppointment'));
const Auth = lazy(() => import('./components/utils/Auth'));
const ClientDashboard = lazy(() => import('./components/pages/client/ClientDashboard'));
const ClientHome = lazy(() => import('./components/pages/client/ClientHome'));
const ClientAbout = lazy(() => import('./components/pages/client/ClientAbout'));
const ClientMenu = lazy(() => import('./components/pages/client/ClientMenu'));
const ClientCart = lazy(() => import('./components/pages/client/ClientCart'));
const ClientProfile = lazy(() => import('./components/pages/client/ClientProfile'));
const ClientServices = lazy(() => import('./components/pages/client/ClientServices'));
const ClientMessages = lazy(() => import('./components/pages/client/ClientMessages'));
const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./components/pages/admin/AdminOrders'));
const AdminItemList = lazy(() => import('./components/pages/admin/AdminItemList'));
const AdminMessages = lazy(() => import('./components/pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./components/pages/admin/AdminSettings'));
const AdminClients = lazy(() => import('./components/pages/admin/AdminClients'));
const AdminAppointments = lazy(() => import('./components/pages/admin/AdminAppointments'));
const AdminAnalytics = lazy(() => import('./components/pages/admin/AdminAnalytics'));
const AdminReport = lazy(() => import('./components/pages/admin/AdminReport'));
const AdminDocuments = lazy(() => import('./components/pages/admin/AdminDocuments'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const SuperAdmin = lazy(() => import('./components/pages/superadmin/SuperAdmin'));
const SuperAdminReport = lazy(() => import('./components/pages/superadmin/SuperAdminReport'));
const ErrorPage = lazy(() => import('./components/static/error/ErrorPage'));
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
        <Router basename="/funeraria">
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
                <Route path="appointments" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientAppointment />
                  </Suspense>
                } />
                <Route path="order/customized-order" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientCart />
                  </Suspense>
                } />
                <Route path="order/funeral-order" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientPackageCart />
                  </Suspense>
                } />
                <Route path="order/active-orders" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientActiveOrders />
                  </Suspense>
                } />
                <Route path="order/order-history" element={
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
                <Route path="services/customized-services" element={
                  <Suspense fallback={<LoadingScreen />}>
                      <ClientCustomized />
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