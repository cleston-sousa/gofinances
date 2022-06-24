import React from 'react';
import { Container, Icon, Title, Button } from './styles';
import { RectButtonProps } from 'react-native-gesture-handler';

const icon = {
  up: 'arrow-up-circle',
  down: 'arrow-down-circle'
};

interface Props extends RectButtonProps {
  title: string;
  type: 'up' | 'down';
  isActive: boolean;
}

export function TransactionTypeButton({
  title,
  type,
  isActive,
  ...rest
}: Props) {
  return (
    <Container isActive={isActive} type={type}>
      <Button {...rest}>
        <Icon type={type} name={icon[type]} />
        <Title>{title}</Title>
      </Button>
    </Container>
  );
}
