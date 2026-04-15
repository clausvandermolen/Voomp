import { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

const PERSISTED_PAGES = ['home', 'profile', 'messages', 'create'];

export function NavigationProvider({ children }) {
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem('voomp_page');
    return PERSISTED_PAGES.includes(saved) ? saved : 'landing';
  });
  const [selectedListing, setSelectedListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapViewState, setMapViewState] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, mode: "register" });
  const [profileTab, setProfileTab] = useState("profile");

  const navigate = (p, opts) => {
    setPage(p);
    if (p === "profile" && opts?.tab) setProfileTab(opts.tab);
    if (PERSISTED_PAGES.includes(p)) {
      sessionStorage.setItem('voomp_page', p);
    } else {
      sessionStorage.removeItem('voomp_page');
    }
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{
      page, navigate,
      selectedListing, setSelectedListing,
      editingListing, setEditingListing,
      filterOpen, setFilterOpen,
      showMap, setShowMap,
      mapViewState, setMapViewState,
      authModal, setAuthModal,
      profileTab, setProfileTab,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
