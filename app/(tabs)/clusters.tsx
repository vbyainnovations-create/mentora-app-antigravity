import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Star, Filter } from 'lucide-react-native';

export default function ClustersScreen() {
  const clusters = [
    { id: "C-01", title: "Class 10 - Mathematics Mastery", modules: 12, price: "₹15,000", rating: 4.9, tags: ["CBSE", "Board Exam"] },
    { id: "C-02", title: "Class 12 - Physics (CBSE + JEE)", modules: 18, price: "₹24,000", rating: 4.8, tags: ["JEE Mains", "Advanced"] },
    { id: "C-03", title: "Class 8 - Foundation Science", modules: 10, price: "₹12,000", rating: 4.7, tags: ["Target NCERT"] }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 bg-white" edges={['top']}>
      <View className="flex-row justify-between items-center px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Discover Programs</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center">
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 pt-6">
        {clusters.map((cluster) => (
          <TouchableOpacity key={cluster.id} className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-start mb-4">
              <View className="w-14 h-14 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                <BookOpen size={24} color="#31975B" />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm font-bold text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'Inter' }}>{cluster.id}</Text>
                  <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text className="text-xs font-bold text-amber-900 ml-1" style={{ fontFamily: 'Inter' }}>{cluster.rating}</Text>
                  </View>
                </View>
                <Text className="text-lg font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: 'Outfit' }}>{cluster.title}</Text>
                
                <View className="flex-row flex-wrap mt-1">
                  {cluster.tags.map((tag, i) => (
                    <View key={i} className="bg-gray-100 rounded-md px-2 py-1 mr-2 mb-2">
                       <Text className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'Inter' }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Inter' }}>{cluster.modules} Study Modules</Text>
              <Text className="text-[#194F8A] font-bold text-lg" style={{ fontFamily: 'Outfit' }}>{cluster.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
