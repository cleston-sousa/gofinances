import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { google_client_id } = process.env;
const { google_redirect_uri } = process.env;

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signinGoogle(): Promise<void>;
  signinApple(): Promise<void>;
  signout(): Promise<void>;
  isUserLoading: boolean;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const userStorageKey = '@gofinances:user';

  async function signinApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME
        ]
      });

      if (credential) {
        const user: User = {
          id: credential.user,
          name: credential.fullName!.givenName!,
          email: credential.email!,
          photo: undefined
        };

        setUser(user);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function signinGoogle() {
    try {
      const response_type = 'token';
      const scope = encodeURI('profile email');
      const auth_token_url = 'https://accounts.google.com/o/oauth2/v2/auth';
      const auth_userinfo_url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';

      const authUrl =
        auth_token_url +
        `?prompt=select_account&client_id=${google_client_id}&redirect_uri=${google_redirect_uri}&response_type=${response_type}&scope=${scope}`;

      const { type, params } = (await AuthSession.startAsync({ authUrl })) as AuthorizationResponse;

      if (type === 'success') {
        const response = await fetch(auth_userinfo_url + `&access_token=${params.access_token}`);
        const userinfo = await response.json();

        const user: User = {
          id: String(userinfo.id),
          name: userinfo.given_name,
          email: userinfo.email,
          photo: userinfo.picture
        };

        setUser(user);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function signout() {
    setIsUserLoading(true);
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
    setIsUserLoading(false);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      setIsUserLoading(true);
      const userStorage = await AsyncStorage.getItem(userStorageKey);
      if (userStorage) {
        const user = JSON.parse(userStorage) as User;
        setUser(user);
      }
      setIsUserLoading(false);
    }
    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signinGoogle, signinApple, signout, isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
