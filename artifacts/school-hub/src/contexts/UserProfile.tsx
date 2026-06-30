import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfileData {
  name: string;
  board: string;
  classLevel: string;
  stream: string;
}

const DEFAULT_PROFILE: UserProfileData = {
  name: "",
  board: "",
  classLevel: "",
  stream: "",
};

interface UserProfileCtx {
  profile: UserProfileData;
  setProfile: (p: UserProfileData) => void;
  hasProfile: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const UserProfileContext = createContext<UserProfileCtx>({
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
  hasProfile: false,
  isDark: true,
  toggleTheme: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfileData>(() => {
    try {
      const stored = localStorage.getItem("school-hub-profile");
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("school-hub-theme") !== "light";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("school-hub-theme", isDark ? "dark" : "light");
  }, [isDark]);

  function setProfile(p: UserProfileData) {
    setProfileState(p);
    try {
      localStorage.setItem("school-hub-profile", JSON.stringify(p));
    } catch {}
  }

  function toggleTheme() {
    setIsDark((v) => !v);
  }

  const hasProfile = Boolean(profile.name || profile.board || profile.classLevel);

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, hasProfile, isDark, toggleTheme }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
