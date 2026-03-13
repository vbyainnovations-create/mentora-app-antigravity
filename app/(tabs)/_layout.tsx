import { Tabs } from 'expo-router';
import { Home, BookOpen, Clock, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#194F8A', // Mentora Blue
      tabBarInactiveTintColor: '#6B7280',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#ffffff',
      },
      headerTitleStyle: {
        fontFamily: 'Outfit',
        color: '#194F8A',
      },
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clusters"
        options={{
          title: 'Clusters',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
