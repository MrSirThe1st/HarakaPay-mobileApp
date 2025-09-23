import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, School, Users, CreditCard, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import SchoolsScreen from '../screens/SchoolsScreen';
import StudentsScreen from '../screens/StudentsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentSelectionScreen from '../screens/PaymentSelectionScreen';
import StudentPaymentScreen from '../screens/StudentPaymentScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Home size={size} color={color} />;
            case 'Schools':
              return <School size={size} color={color} />;
            case 'Students':
              return <Users size={size} color={color} />;
            case 'Payments':
              return <CreditCard size={size} color={color} />;
            case 'Profile':
              return <User size={size} color={color} />;
            default:
              return <Home size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#F9FAFB',
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom, 5),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
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

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="StudentPayment" component={StudentPaymentScreen} />
    </Stack.Navigator>
  );
}
