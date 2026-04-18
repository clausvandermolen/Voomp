import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const routerNavigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let page = 'landing';
  if (path === '/') page = 'landing';
  else if (path.startsWith('/home')) page = 'home';
  else if (path.startsWith('/profile')) page = 'profile';
  else if (path.startsWith('/messages')) page = 'messages';
  else if (path.startsWith('/create')) page = 'create';
  else if (path.startsWith('/listing')) page = 'listing';

  const [selectedListing, setSelectedListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapViewState, setMapViewState] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, mode: "register" });
  const [profileTab, setProfileTab] = useState("profile");
  const [profileDashboardSubTab, setProfileDashboardSubTab] = useState(null);

  const navigate = (p, opts) => {
    window.scrollTo(0, 0);

    if (p === "landing") routerNavigate("/");
    else if (p === "home") routerNavigate("/home");
    else if (p === "profile") {
      const tab = opts?.tab;
      const subTab = opts?.subTab;
      if (tab && tab !== "profile") {
        routerNavigate(subTab ? `/profile/${tab}/${subTab}` : `/profile/${tab}`);
      } else {
        routerNavigate("/profile");
      }
    }
    else if (p === "messages") routerNavigate("/messages");
    else if (p === "create") routerNavigate("/create");
    else if (p === "listing" && opts?.id) {
      let url = `/listing/${opts.id}`;
      if (opts.title) {
        const slug = opts.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        url += `/${slug}`;
      }
      routerNavigate(url);
    }
    else if (p === "listing" && selectedListing?.id) routerNavigate(`/listing/${selectedListing.id}`);
    else routerNavigate(`/${p}`);
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
      profileDashboardSubTab, setProfileDashboardSubTab,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
