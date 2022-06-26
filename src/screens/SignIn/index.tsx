import React, { useContext } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';

import { Container, Footer, FooterWrapper, Header, SignInTitle, Title, TitleWrapper } from './styles';

import { SignInSocialButton } from '../../components/SignInSocialButton';

import LogoSvg from '../../assets/logo.svg';
import GoogleSvg from '../../assets/google.svg';
import AppleSvg from '../../assets/apple.svg';

import { useAuth } from '../../hooks/auth';

export function SignIn() {
  const data = useAuth();

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
        <FooterWrapper>
          <SignInSocialButton svg={GoogleSvg} title="Entrar com Google" />
          <SignInSocialButton svg={AppleSvg} title="Entrar com Apple" />
        </FooterWrapper>
      </Footer>
    </Container>
  );
}
