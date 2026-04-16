import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ListingsProvider } from './contexts/ListingsContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

function MessagesWrapper({ children }) {
  const { user } = useAuth();
  return (
    <MessagesProvider userId={user?.id}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </MessagesProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <ListingsProvider>
            <BookingsProvider>
              <MessagesWrapper>
                <App />
              </MessagesWrapper>
            </BookingsProvider>
          </ListingsProvider>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
