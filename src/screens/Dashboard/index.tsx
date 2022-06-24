import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components';

import HighlightCard from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
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
  LogoutButton,
  LoadContainer
} from './styles';

export interface TransactionProps extends TransactionCardProps {
  id: string;
}

interface highlightTransactionProps {
  total: string;
  lastTransaction: string;
}

interface HighlightTransactions {
  income: highlightTransactionProps;
  outcome: highlightTransactionProps;
  balance: highlightTransactionProps;
}

export function Dashboard() {
  const storageKey = '@gofinances:transactions';

  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(true);

  const [transactionsList, setTransactionsList] = useState<TransactionProps[]>([]);

  const [highlightTransactions, setHighlightTransactions] = useState<HighlightTransactions>(
    {} as HighlightTransactions
  );

  function numberToCurrencyLocaleString(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function timestampToDateLocaleString(value: number | string, format: Intl.DateTimeFormatOptions) {
    const date = new Date(value);
    return Intl.DateTimeFormat('pt-BR', format).format(date);
  }

  function getLastTransaction(collection: TransactionProps[], type?: TransactionCardProps['type']) {
    let transactionList = collection;
    if (typeof type !== 'undefined') {
      transactionList = collection.filter((item) => item.type === type);
    }

    const timestampList = transactionList.map((item) => new Date(item.date).getTime());
    const greaterTimestamp = Math.max(...timestampList); //Math.max.aplly(Math, timestampList);

    const result = timestampToDateLocaleString(greaterTimestamp, {
      day: '2-digit',
      month: 'long'
    });

    return result;
  }

  async function loadTransactions() {
    const storagePlainResult = await AsyncStorage.getItem(storageKey);
    const storageItemList = storagePlainResult ? JSON.parse(storagePlainResult) : [];

    let incomeTotal = 0;
    let outcomeTotal = 0;

    const transactionsFormatted: TransactionProps[] = storageItemList.map((item: TransactionProps) => {
      if (item.type === 'positive') {
        incomeTotal += Number(item.amount);
      } else {
        outcomeTotal += Number(item.amount);
      }

      const amount = numberToCurrencyLocaleString(Number(item.amount));

      const date = timestampToDateLocaleString(item.date, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });

      return {
        amount,
        date,
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category
      };
    });

    const lastIncome = getLastTransaction(storageItemList, 'positive');

    const lastOutcome = getLastTransaction(storageItemList, 'negative');

    const lastTransaction = getLastTransaction(storageItemList);

    setTransactionsList(transactionsFormatted);

    setHighlightTransactions({
      income: {
        total: numberToCurrencyLocaleString(incomeTotal),
        lastTransaction: lastIncome
      },
      outcome: {
        total: numberToCurrencyLocaleString(outcomeTotal),
        lastTransaction: lastOutcome
      },
      balance: {
        total: numberToCurrencyLocaleString(incomeTotal - outcomeTotal),
        lastTransaction: lastTransaction
      }
    });

    setIsLoading(false);
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
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
        </LoadContainer>
      ) : (
        <>
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
              lastTransaction={`Ultima entrada em ${highlightTransactions?.income?.lastTransaction}`}
              type="up"
            />
            <HighlightCard
              title="Saída"
              amount={highlightTransactions?.outcome?.total}
              lastTransaction={`Ultima saída em ${highlightTransactions?.outcome?.lastTransaction}`}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightTransactions?.balance?.total}
              lastTransaction={`Ultima transação em ${highlightTransactions?.balance?.lastTransaction}`}
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
        </>
      )}
    </Container>
  );
}
