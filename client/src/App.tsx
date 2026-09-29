import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { RealtimeProvider } from './contexts/RealtimeContext.js';
import { Header } from './components/common/Header.js';
import { BottomNav } from './components/common/BottomNav.js';
import { AlertBanner } from './components/common/AlertBanner.js';
import { ToastContainer } from './components/common/ToastContainer.js';

import { HomePage } from './pages/HomePage.js';
import { MapPage } from './pages/MapPage.js';
import { HelpPage } from './pages/HelpPage.js';
import { CommunityPage } from './pages/CommunityPage.js';
import { SheltersPage } from './pages/SheltersPage.js';
import { ResourcesPage } from './pages/ResourcesPage.js';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
            <Header />
            <AlertBanner />
            <ToastContainer />

            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/shelters" element={<SheltersPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/volunteer" element={<VolunteerDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <BottomNav />
          </div>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
