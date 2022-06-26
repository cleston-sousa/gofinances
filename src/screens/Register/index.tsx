import React, { useState } from 'react';
import * as yup from 'yup';
import { useForm, FieldValues } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { Keyboard, Modal, Alert } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../hooks/auth';

import { InputForm } from '../../components/Form/InputForm';
import { Button } from '../../components/Form/Button';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelect } from '../CategorySelect';

import { Container, Fields, Form, Header, Title, TransactionsTypes } from './styles';

interface FormData extends FieldValues {
  name: string;
  amount: string;
}

const schema = yup.object().shape({
  name: yup.string().required('nome é obrigatorio'),
  amount: yup.number().typeError('informe apenas numeros').positive('apenas positiov').required('valor obriatorio')
});

export function Register() {
  const { user } = useAuth();

  const storageKey = `@gofinances:transactions_ser:${user.id}`;

  const [transactionType, setTransactionType] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria'
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const navigation = useNavigation();

  function handleTransactionTypeSelection(type: 'positive' | 'negative') {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  }

  async function handleRegister(form: FormData) {
    if (!transactionType) return Alert.alert('selecione o tipo da transacao');

    if (category.key === 'category') return Alert.alert('selecione a categoria');

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date()
    };

    try {
      const data = await AsyncStorage.getItem(storageKey);
      const currentData = data ? JSON.parse(data) : [];
      const dataFormatted = [...currentData, newTransaction];

      await AsyncStorage.setItem(storageKey, JSON.stringify(dataFormatted));

      reset();

      setTransactionType('');

      setCategory({
        key: 'category',
        name: 'Categoria'
      });

      navigation.navigate('Listagem');
    } catch (error) {
      console.log(error);
      Alert.alert('nao foi possivel salvar');
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} containerStyle={{ flex: 1 }} style={{ flex: 1 }}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              placeholder="Nome"
              name="name"
              control={control}
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              placeholder="Preço"
              name="amount"
              control={control}
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />
            <TransactionsTypes>
              <TransactionTypeButton
                title="entrada"
                type="up"
                onPress={() => handleTransactionTypeSelection('positive')}
                isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton
                title="saida"
                type="down"
                onPress={() => handleTransactionTypeSelection('negative')}
                isActive={transactionType === 'negative'}
              />
            </TransactionsTypes>
            <CategorySelectButton title={category.name} onPress={handleOpenSelectCategoryModal} />
          </Fields>
          {/* <Button title="RemoveAll" onPress={removeAll} /> */}
          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>
        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
