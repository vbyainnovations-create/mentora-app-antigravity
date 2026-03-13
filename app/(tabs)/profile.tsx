import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard, HelpCircle, LogOut, ChevronRight, UserCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-gray-50 bg-white" edges={['top']}>
      <ScrollView className="px-6 pt-6">
        {/* Profile Card */}
        <View className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-[#194F8A] items-center justify-center mr-4">
            <Text className="text-white font-bold text-xl" style={{ fontFamily: 'Outfit' }}>MB</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>Michael B.</Text>
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>+91 98765 43210</Text>
            <View className="mt-2 bg-emerald-50 self-start px-2 py-1 rounded border border-emerald-100">
               <Text className="text-xs font-bold text-emerald-800" style={{ fontFamily: 'Inter' }}>Verified Parent</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                <Settings size={20} color="#4B5563" />
              </View>
              <Text className="text-base font-medium text-gray-800" style={{ fontFamily: 'Inter' }}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                <CreditCard size={20} color="#4B5563" />
              </View>
              <Text className="text-base font-medium text-gray-800" style={{ fontFamily: 'Inter' }}>Payment Methods</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                <HelpCircle size={20} color="#4B5563" />
              </View>
              <Text className="text-base font-medium text-gray-800" style={{ fontFamily: 'Inter' }}>Support & FAQs</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-red-50 border border-red-100 rounded-2xl p-4 flex-row justify-center items-center mb-4">
          <LogOut size={20} color="#DC2626" />
          <Text className="text-red-600 font-bold ml-2" style={{ fontFamily: 'Inter' }}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/(tutor)')}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row justify-center items-center"
        >
          <UserCircle size={20} color="#194F8A" />
          <Text className="text-[#194F8A] font-bold ml-2" style={{ fontFamily: 'Inter' }}>Switch to Tutor Portal</Text>
        </TouchableOpacity>
        
        <View className="items-center mt-8 mb-10">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Outfit' }}>Mentora Edutors</Text>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Inter' }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
