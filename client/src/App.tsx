import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { TaskManagementPage } from './pages/TaskManagementPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { LearningHubPage } from './pages/LearningHubPage';
import { DocumentAnalyzerPage } from './pages/DocumentAnalyzerPage';
import { FocusModePage } from './pages/FocusModePage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface dark:bg-nexora-bg text-on-surface dark:text-nexora-text transition-colors duration-200">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/tasks" element={<TaskManagementPage />} />
                <Route path="/assistant" element={<AiAssistantPage />} />
                <Route path="/learning" element={<LearningHubPage />} />
                <Route path="/analyzer" element={<DocumentAnalyzerPage />} />
                <Route path="/focus" element={<FocusModePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                {/* Fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
