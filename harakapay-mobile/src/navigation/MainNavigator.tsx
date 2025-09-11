import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import HomeScreen from '../screens/HomeScreen';
import SchoolsScreen from '../screens/SchoolsScreen';
import StudentsScreen from '../screens/StudentsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Schools':
              iconName = 'school';
              break;
            case 'Students':
              iconName = 'people';
              break;
            case 'Payments':
              iconName = 'payment';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schools" component={SchoolsScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
