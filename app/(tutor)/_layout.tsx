import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarDays, BookMarked, UserCircle } from 'lucide-react-native';

export default function TutorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#194F8A',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontFamily: 'Outfit', color: '#194F8A' },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: 'Modules',
          tabBarIcon: ({ color }) => <BookMarked size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
