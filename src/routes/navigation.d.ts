import { RootStackParamList } from './app.routes';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
