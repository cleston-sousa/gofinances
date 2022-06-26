import React, { createContext, ReactNode, useContext, useState } from 'react';
import * as AuthSession from 'expo-auth-session';

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

  async function signinGoogle() {
    try {
      const response_type = 'token';
      const scope = encodeURI('profile email');
      const auth_token_url = 'https://accounts.google.com/o/oauth2/v2/auth';
      const auth_userinfo_url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';

      const authUrl =
        auth_token_url +
        `?client_id=${google_client_id}&redirect_uri=${google_redirect_uri}&response_type=${response_type}&scope=${scope}`;

      const { type, params } = (await AuthSession.startAsync({ authUrl })) as AuthorizationResponse;

      if (type === 'success') {
        const response = await fetch(auth_userinfo_url + `&access_token=${params.access_token}`);
        const userinfo = await response.json();

        const user: User = {
          id: userinfo.id,
          name: userinfo.name,
          email: userinfo.email,
          photo: userinfo.picture
        };

        setUser(user);

        console.log(user);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  return <AuthContext.Provider value={{ user, signinGoogle }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
