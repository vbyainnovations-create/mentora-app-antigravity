import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, HelpCircle, LogOut, ChevronRight, IndianRupee, Star, BadgeCheck, UserCircle } from 'lucide-react-native';

const tutor = {
  name: 'Ramesh Singh',
  initials: 'RS',
  phone: '+91 98765 43210',
  subjects: ['Mathematics', 'Physics'],
  experience: '7 years',
  rating: 4.9,
  sessionsCompleted: 312,
};

const earnings = {
  thisMonth: '₹31,200',
  pendingPayout: '₹8,470',
  totalEarned: '₹1,84,500',
};

const menuItems = [
  { icon: Settings, label: 'Account Settings' },
  { icon: HelpCircle, label: 'Support & FAQs' },
];

export default function TutorProfileScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-[#194F8A] rounded-2xl p-6 mb-6 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mr-4">
              <Text className="text-white font-bold text-2xl" style={{ fontFamily: 'Outfit' }}>
                {tutor.initials}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'Outfit' }}>
                {tutor.name}
              </Text>
              <Text className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                {tutor.phone}
              </Text>
              <View className="flex-row items-center bg-white/20 self-start px-2.5 py-1 rounded-full">
                <BadgeCheck size={13} color="#6EE7B7" />
                <Text className="text-xs font-bold text-emerald-200 ml-1" style={{ fontFamily: 'Inter' }}>
                  Verified Tutor
                </Text>
              </View>
            </View>
          </View>

          <View className="border-t border-white/20 pt-4 flex-row justify-around">
            <View className="items-center">
              <View className="flex-row items-center">
                <Star size={14} color="#FCD34D" fill="#FCD34D" />
                <Text className="text-white font-bold text-lg ml-1" style={{ fontFamily: 'Outfit' }}>
                  {tutor.rating}
                </Text>
              </View>
              <Text className="text-blue-200 text-xs mt-1" style={{ fontFamily: 'Inter' }}>Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit' }}>
                {tutor.sessionsCompleted}
              </Text>
              <Text className="text-blue-200 text-xs mt-1" style={{ fontFamily: 'Inter' }}>Sessions</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit' }}>
                {tutor.experience}
              </Text>
              <Text className="text-blue-200 text-xs mt-1" style={{ fontFamily: 'Inter' }}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Subjects */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3" style={{ fontFamily: 'Inter' }}>
            Subjects
          </Text>
          <View className="flex-row flex-wrap">
            {tutor.subjects.map((s) => (
              <View key={s} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg mr-2 mb-2">
                <Text className="text-sm font-bold text-[#194F8A]" style={{ fontFamily: 'Inter' }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Earnings */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3" style={{ fontFamily: 'Inter' }}>
            Earnings
          </Text>
          <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-4 items-center border-r border-gray-100">
                <Text className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter' }}>This Month</Text>
                <Text className="text-lg font-bold text-[#194F8A]" style={{ fontFamily: 'Outfit' }}>{earnings.thisMonth}</Text>
              </View>
              <View className="flex-1 p-4 items-center">
                <Text className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter' }}>Pending Payout</Text>
                <Text className="text-lg font-bold text-amber-600" style={{ fontFamily: 'Outfit' }}>{earnings.pendingPayout}</Text>
              </View>
            </View>
            <View className="p-4 items-center bg-gray-50">
              <Text className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter' }}>Total Earned (All Time)</Text>
              <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>{earnings.totalEarned}</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center justify-between p-4 ${
                idx < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                  <item.icon size={20} color="#4B5563" />
                </View>
                <Text className="text-base font-medium text-gray-800" style={{ fontFamily: 'Inter' }}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="bg-red-50 border border-red-100 rounded-2xl p-4 flex-row justify-center items-center mb-4">
          <LogOut size={20} color="#DC2626" />
          <Text className="text-red-600 font-bold ml-2" style={{ fontFamily: 'Inter' }}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex-row justify-center items-center"
        >
          <UserCircle size={20} color="#059669" />
          <Text className="text-emerald-600 font-bold ml-2" style={{ fontFamily: 'Inter' }}>Switch to Parent Portal</Text>
        </TouchableOpacity>

        <View className="items-center mt-4 mb-10">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Outfit' }}>
            Mentora Edutors
          </Text>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Inter' }}>Tutor App – Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
