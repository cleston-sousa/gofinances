import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HighlightCard from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps
} from '../../components/TransactionCard';
import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

export function Dashboard() {
  const dataKey = '@gofinances:transactions';

  const [data, setData] = useState<DataListProps[]>([]);

  async function loadTransactions() {
    const data = await AsyncStorage.getItem(dataKey);
    const currentData = data ? JSON.parse(data) : [];

    const dataFormatted: DataListProps[] = currentData.map(
      (item: DataListProps) => {
        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(new Date(item.date));

        return {
          amount,
          date,
          id: item.id,
          name: item.name,
          type: item.type,
          category: item.category
        };
      }
    );
    setData(dataFormatted);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo
              source={{
                uri: 'https://avatars.githubusercontent.com/u/26007139?v=4'
              }}
            />
            <User>
              <UserGreeting>Yo,</UserGreeting>
              <UserName>Noid!</UserName>
            </User>
          </UserInfo>

          <LogoutButton
            onPress={() => {
              console.log('saiu');
            }}
          >
            <Icon name="power" />
          </LogoutButton>
        </UserWrapper>
      </Header>
      <HighlightCards>
        <HighlightCard
          title="Entradas"
          amount="R$ 17.000,00"
          lastTransaction="Ultima entrada em 30 de jun"
          type="up"
        />
        <HighlightCard
          title="Saída"
          amount="R$ 17.000,00"
          lastTransaction="Ultima entrada em 30 de jun"
          type="down"
        />
        <HighlightCard
          title="Total"
          amount="R$ 17.000,00"
          lastTransaction="Ultima entrada em 30 de jun"
          type="total"
        />
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  );
}
