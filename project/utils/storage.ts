import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

export const clearUserData = async () => {
  await AsyncStorage.removeItem('user');
};
