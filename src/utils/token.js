import AsyncStorage from '@react-native-async-storage/async-storage';

// Store the token
export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

// Get the token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove the token (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// Check if user is logged in
export const isLoggedIn = async () => {
  const token = await getToken();
  return token !== null;
};