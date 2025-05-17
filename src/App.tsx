
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Creators from "./pages/Creators";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import FAQ from "./pages/FAQ";
import FindInfluencers from "./pages/FindInfluencers";
import NotFound from "./pages/NotFound";
import CreatorRegistration from "./pages/CreatorRegistration";
import CreatorProfile from "./pages/creator-registration/CreatorProfile";
import CreatorAgency from "./pages/creator-registration/CreatorAgency";
import CreatorIPRights from "./pages/creator-registration/CreatorIPRights";
import CreatorTerms from "./pages/creator-registration/CreatorTerms";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreators from "./pages/admin/AdminCreators";
import AdminVideoRequests from "./pages/admin/AdminVideoRequests";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import PendingVerifications from "./pages/admin/PendingVerifications";
import { AuthProvider } from "./contexts/AuthContext";
import { CreatorApplicationProvider } from "./contexts/CreatorApplicationContext";
import CreatorDetail from "./pages/CreatorDetail";

// Import creator pages
import CreatorDashboard from "./pages/CreatorDashboard";
import VideoRequests from "./pages/creator/VideoRequests";
import ProfileSettings from "./pages/creator/ProfileSettings";
import Revenue from "./pages/creator/Revenue";
import Reviews from "./pages/creator/Reviews";
import ActivityStatus from "./pages/creator/ActivityStatus";
import HelpSupport from "./pages/creator/HelpSupport";
import CreatorLayout from "./components/CreatorLayout";
import CreatorRoute from "./components/CreatorRoute";
import RequestVideo from "./pages/RequestVideo";
import MyVideos from "./pages/MyVideos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreatorApplicationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/join" element={<CreatorRegistration />} />
              <Route path="/join/profile" element={<CreatorProfile />} />
              <Route path="/join/agency" element={<CreatorAgency />} />
              <Route path="/join/ip-rights" element={<CreatorIPRights />} />
              <Route path="/join/terms" element={<CreatorTerms />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/creators/:creatorId" element={<CreatorDetail />} />
              <Route path="/find-influencers" element={<FindInfluencers />} />
              <Route path="/request-video/:creatorId" element={<RequestVideo />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Admin Login Route */}
              <Route path="/admin-panel" element={<AdminLogin />} />

              {/* Protected Routes - require authentication */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/my-videos" element={
                <ProtectedRoute>
                  <MyVideos />
                </ProtectedRoute>
              } />

              {/* Creator Routes - nested under a parent route with CreatorLayout */}
              <Route path="/creator" element={
                <CreatorRoute>
                  <CreatorLayout />
                </CreatorRoute>
              }>
                <Route index element={<CreatorDashboard />} />
                <Route path="requests" element={<VideoRequests />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="activity" element={<ActivityStatus />} />
                <Route path="help" element={<HelpSupport />} />
              </Route>

              {/* Redirect old creator routes to new nested routes */}
              <Route path="/creator-dashboard" element={<Navigate to="/creator" replace />} />
              <Route path="/creator-requests" element={<Navigate to="/creator/requests" replace />} />
              <Route path="/creator-profile" element={<Navigate to="/creator/profile" replace />} />
              <Route path="/creator-revenue" element={<Navigate to="/creator/revenue" replace />} />
              <Route path="/creator-reviews" element={<Navigate to="/creator/reviews" replace />} />
              <Route path="/creator-activity" element={<Navigate to="/creator/activity" replace />} />
              <Route path="/creator-help" element={<Navigate to="/creator/help" replace />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/creators" element={
                <AdminRoute>
                  <AdminCreators />
                </AdminRoute>
              } />
              <Route path="/admin/pending-verifications" element={
                <AdminRoute>
                  <PendingVerifications />
                </AdminRoute>
              } />
              <Route path="/admin/video-requests" element={
                <AdminRoute>
                  <AdminVideoRequests />
                </AdminRoute>
              } />
              <Route path="/admin/revenue" element={
                <AdminRoute>
                  <AdminRevenue />
                </AdminRoute>
              } />
              <Route path="/admin/reviews" element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } />
              <Route path="/admin/notifications" element={
                <AdminRoute>
                  <AdminNotifications />
                </AdminRoute>
              } />
              <Route path="/admin/activity-logs" element={
                <AdminRoute>
                  <AdminActivityLogs />
                </AdminRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CreatorApplicationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
