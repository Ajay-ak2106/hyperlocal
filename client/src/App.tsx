import React from 'react';
import { useEffect } from 'react'
import { testSupabaseConnection } from './lib/supabaseTest'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { RealtimeProvider } from './contexts/RealtimeContext.js';
import { Layout } from './components/common/Layout.js';

import { HomePage } from './pages/HomePage.js';
import { MapPage } from './pages/MapPage.js';

import { CommunityPage } from './pages/CommunityPage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { SheltersPage } from './pages/SheltersPage.js';
import { ResourcesPage } from './pages/ResourcesPage.js';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { FundPage } from './pages/FundPage.js';

export const App: React.FC = () => {
  useEffect(() => {
    testSupabaseConnection()
  }, [])
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/report" element={<HomePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/shelters" element={<SheltersPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/fund" element={<FundPage />} />
              <Route path="/volunteer" element={<VolunteerDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
