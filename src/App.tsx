import { useState } from 'react';
import UserTypeSelection from './components/UserTypeSelection';
import Dashboard from './components/Dashboard';
import AdminAnalytics from './components/AdminAnalytics';

type ViewType = 'selection' | 'guardian' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('selection');

  if (currentView === 'selection') {
    return (
      <UserTypeSelection
        onSelectGuardian={() => setCurrentView('guardian')}
        onSelectAdmin={() => setCurrentView('admin')}
      />
    );
  }

  if (currentView === 'admin') {
    return <AdminAnalytics onBack={() => setCurrentView('selection')} />;
  }

  return <Dashboard onBack={() => setCurrentView('selection')} />;
}

export default App;
