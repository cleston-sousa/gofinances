import React, { useState, useCallback } from 'react';
import { useTheme } from 'styled-components';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VictoryPie } from 'victory-native';

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
import { HistoryCard } from '../../components/HistoryCard';
import { LoadContainer } from '../../components/LoadContainer';
import { categories } from '../../utils/categories';
import { numberToCurrencyLocaleString } from '../../utils/parse';

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

  const [isLoading, setIsLoading] = useState(false);

  const [totalCategories, setTotalCategories] = useState<CategoryResumeProps[]>([]);

  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());

  function handleDateChange(action: 'next' | 'prev') {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function loadTransactions() {
    setIsLoading(true);

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

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer />
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
