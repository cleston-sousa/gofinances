import { AppRoutesParamList } from './app.routes';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRoutesParamList {}
  }
}
