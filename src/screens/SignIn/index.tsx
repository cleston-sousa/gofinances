import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';

import { Container, Footer, FooterWrapper, Header, SignInTitle, Title, TitleWrapper } from './styles';

import { SignInSocialButton } from '../../components/SignInSocialButton';

import LogoSvg from '../../assets/logo.svg';
import GoogleSvg from '../../assets/google.svg';
import AppleSvg from '../../assets/apple.svg';

import { useAuth } from '../../hooks/auth';

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const theme = useTheme();

  const { signinGoogle, signinApple } = useAuth();

  async function handleSigninGoogle() {
    try {
      setIsAuthenticating(true);
      await signinGoogle();
    } catch (error) {
      console.log(error);
      Alert.alert('Nao foi Google');
      setIsAuthenticating(false);
    }
  }

  async function handleSigninApple() {
    try {
      setIsAuthenticating(true);
      await signinApple();
    } catch (error) {
      console.log(error);
      Alert.alert('Nao foi Apple');
      setIsAuthenticating(false);
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)} />
          <Title>
            Controle suas {'\n'}finanças de forma {'\n'}muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>Faça seu login com {'\n'}uma das contas abaixo</SignInTitle>
      </Header>
      <Footer>
        {!isAuthenticating && (
          <FooterWrapper>
            <SignInSocialButton svg={GoogleSvg} title="Entrar com Google" onPress={handleSigninGoogle} />
            {Platform.OS === 'ios' && (
              <SignInSocialButton svg={AppleSvg} title="Entrar com Apple" onPress={handleSigninApple} />
            )}
          </FooterWrapper>
        )}
        {isAuthenticating && <ActivityIndicator color={theme.colors.shape} size="large" style={{ marginTop: 18 }} />}
      </Footer>
    </Container>
  );
}
