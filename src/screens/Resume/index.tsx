import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { VictoryPie } from 'victory-native';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { HistoryCard } from '../../components/HistoryCard';
import {
  ChartContainer,
  Container,
  Content,
  Header,
  Month,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Title
} from './styles';
import { TransactionProps } from '../Dashboard';
import { LoadContainer } from '../Dashboard/styles';
import { ActivityIndicator } from 'react-native';
import { categories } from '../../utils/categories';
import { numberToCurrencyLocaleString } from '../../utils/parse';
import { RFValue } from 'react-native-responsive-fontsize';

interface CategoryResumeProps {
  key: string;
  name: string;
  totalFormatted: string;
  total: number;
  color: string;
  percent: string;
}

export function Resume() {
  const storageKey = '@gofinances:transactions';

  const [isLoading, setIsLoading] = useState(true);

  const [totalCategories, setTotalCategories] = useState<CategoryResumeProps[]>([]);

  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());

  function handleDateChange(action: 'next' | 'prev') {
    setIsLoading(true);
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function loadTransactions() {
    const storagePlainResult = await AsyncStorage.getItem(storageKey);
    const storageItemList = storagePlainResult ? JSON.parse(storagePlainResult) : [];

    //const outcomeTransactions: TransactionProps[] = storageItemList;

    const outcomeTransactions: TransactionProps[] = storageItemList.filter((item: TransactionProps) => {
      const itemDate = new Date(item.date);
      const sameMonthYear =
        itemDate.getMonth() === selectedDate.getMonth() && itemDate.getFullYear() === selectedDate.getFullYear();
      return item.type === 'negative' && sameMonthYear;
    });

    const totalGlobal = outcomeTransactions.reduce((acumullator: number, item: TransactionProps) => {
      return acumullator + Number(item.amount);
    }, 0);

    const totalByCategory: CategoryResumeProps[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      outcomeTransactions.forEach((item: TransactionProps) => {
        if (category.key === item.category) {
          categorySum += Number(item.amount);
        }
      });

      if (categorySum > 0) {
        const percent = `${((categorySum / totalGlobal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted: numberToCurrencyLocaleString(categorySum),
          percent
        });
      }
    });

    setTotalCategories(totalByCategory);

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Content>
            <MonthSelect>
              <MonthSelectButton onPress={() => handleDateChange('prev')}>
                <MonthSelectIcon name="chevron-left" />
              </MonthSelectButton>
              <Month>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Month>
              <MonthSelectButton onPress={() => handleDateChange('next')}>
                <MonthSelectIcon name="chevron-right" />
              </MonthSelectButton>
            </MonthSelect>

            <ChartContainer>
              <VictoryPie
                data={totalCategories}
                colorScale={totalCategories.map((item) => item.color)}
                x="percent"
                y="total"
                labelRadius={RFValue(50)}
                height={RFValue(350)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape
                  }
                }}
              />
            </ChartContainer>

            {totalCategories.map((item) => (
              <HistoryCard key={item.key} title={item.name} color={item.color} amount={item.totalFormatted} />
            ))}
          </Content>
        </>
      )}
    </Container>
  );
}
