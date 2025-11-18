import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '@screens/LoginScreen';
import SearchScreen from '@screens/SearchScreen';
import {useAuthStore} from '@store/authStore';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const {isAuthenticated} = useAuthStore();

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
      ) : (
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{title: 'Search Routes'}}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
