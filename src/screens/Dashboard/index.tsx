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

export interface TransactionProps extends TransactionCardProps {
  id: string;
}

interface highlightTransactionProps {
  total: string;
}

interface HighlightTransactions {
  income: highlightTransactionProps;
  outcome: highlightTransactionProps;
  balance: highlightTransactionProps;
}

export function Dashboard() {
  const storageKey = '@gofinances:transactions';

  const [transactionsList, setTransactionsList] = useState<TransactionProps[]>(
    []
  );
  const [highlightTransactions, setHighlightTransactions] =
    useState<HighlightTransactions>({} as HighlightTransactions);

  function numberToCurrencyLocaleString(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  async function loadTransactions() {
    const storagePlainResult = await AsyncStorage.getItem(storageKey);
    const storageItemList = storagePlainResult
      ? JSON.parse(storagePlainResult)
      : [];

    let incomeTotal = 0;
    let outcomeTotal = 0;

    const transactionsFormatted: TransactionProps[] = storageItemList.map(
      (item: TransactionProps) => {
        if (item.type === 'positive') {
          incomeTotal += Number(item.amount);
        } else {
          outcomeTotal += Number(item.amount);
        }

        const amount = numberToCurrencyLocaleString(Number(item.amount));

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

    setTransactionsList(transactionsFormatted);
    setHighlightTransactions({
      income: {
        total: numberToCurrencyLocaleString(incomeTotal)
      },
      outcome: {
        total: numberToCurrencyLocaleString(outcomeTotal)
      },
      balance: {
        total: numberToCurrencyLocaleString(incomeTotal - outcomeTotal)
      }
    });
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
          amount={highlightTransactions?.income?.total}
          lastTransaction="Ultima entrada em 30 de jun"
          type="up"
        />
        <HighlightCard
          title="Saída"
          amount={highlightTransactions?.outcome?.total}
          lastTransaction="Ultima entrada em 30 de jun"
          type="down"
        />
        <HighlightCard
          title="Total"
          amount={highlightTransactions?.balance?.total}
          lastTransaction="Ultima entrada em 30 de jun"
          type="total"
        />
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={transactionsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  );
}
