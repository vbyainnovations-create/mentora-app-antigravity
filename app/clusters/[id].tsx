import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, BookOpen, Clock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function ClusterDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cluster, setCluster] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchClusterDetails();
  }, [id]);

  async function fetchClusterDetails() {
    setLoading(true);
    // Fetch cluster
    const { data: clusterData } = await supabase
      .from('clusters')
      .select('*')
      .eq('id', id)
      .single();

    if (clusterData) {
      setCluster(clusterData);
      
      // Fetch modules for this cluster
      const { data: moduleData } = await supabase
        .from('study_modules')
        .select('*')
        .eq('cluster_id', id)
        .order('order_index', { ascending: true });
      
      if (moduleData) {
        setModules(moduleData);
      }
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#194F8A" />
      </View>
    );
  }

  if (!cluster) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-gray-500 font-medium text-center">Cluster not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-[#194F8A] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-50">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10" style={{ fontFamily: 'Outfit' }}>
          Details
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Banner Area */}
        <View className="px-6 pt-6 pb-8 bg-gray-50/50">
          <View className="bg-emerald-100 self-start px-3 py-1 rounded-full mb-4">
            <Text className="text-emerald-800 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'Inter' }}>
              {cluster.grade_level}
            </Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit' }}>
            {cluster.subject}
          </Text>
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center mr-4">
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text className="ml-1 text-sm font-bold text-gray-700" style={{ fontFamily: 'Inter' }}>4.9 (120+ reviews)</Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>12 Weeks</Text>
            </View>
          </View>

          <View className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-500 text-xs mb-1" style={{ fontFamily: 'Inter' }}>Full Cluster Price</Text>
                <Text className="text-2xl font-bold text-[#194F8A]" style={{ fontFamily: 'Outfit' }}>₹{cluster.price}</Text>
              </View>
              <View className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Text className="text-[#194F8A] text-xs font-bold" style={{ fontFamily: 'Inter' }}>Pay per Class available</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push(`/booking/${cluster.id}`)}
              className="bg-[#194F8A] py-4 rounded-xl items-center flex-row justify-center"
            >
              <Text className="text-white font-bold text-lg mr-2" style={{ fontFamily: 'Inter' }}>Book Intro Session</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-center text-gray-400 text-xs mt-3" style={{ fontFamily: 'Inter' }}>
              Try a 30-min demo for free with a top educator
            </Text>
          </View>
        </View>

        {/* Modules */}
        <View className="px-6 py-8">
          <Text className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Outfit' }}>What you'll learn</Text>
          
          {modules.length === 0 ? (
            <View className="bg-gray-50 p-6 rounded-2xl items-center border border-dashed border-gray-200">
              <Text className="text-gray-400" style={{ fontFamily: 'Inter' }}>Curriculum details coming soon</Text>
            </View>
          ) : (
            modules.map((m, idx) => (
              <View key={m.id} className="flex-row mb-6">
                <View className="items-center mr-4">
                  <View className="w-8 h-8 rounded-full bg-[#194F8A]/10 items-center justify-center border border-[#194F8A]/20">
                    <Text className="text-[#194F8A] font-bold text-sm" style={{ fontFamily: 'Outfit' }}>{idx + 1}</Text>
                  </View>
                  {idx !== modules.length - 1 && <View className="w-[1px] flex-1 bg-gray-200 my-1" />}
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-base font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>{m.title}</Text>
                  <Text className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'Inter' }}>
                    {m.content || "Deep dive into core concepts, practical problem solving, and weekly assessments."}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Benefits */}
        <View className="px-6 pb-12">
          <Text className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit' }}>Why this cluster?</Text>
          <View className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
            <View className="flex-row items-start mb-4">
              <ShieldCheck size={20} color="#047857" />
              <View className="ml-3">
                <Text className="font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Verified Educators</Text>
                <Text className="text-sm text-gray-600 mt-0.5" style={{ fontFamily: 'Inter' }}>All tutors go through a 5-step vetting process.</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <BookOpen size={20} color="#047857" />
              <View className="ml-3">
                <Text className="font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Personalized Roadmap</Text>
                <Text className="text-sm text-gray-600 mt-0.5" style={{ fontFamily: 'Inter' }}>Custom module progression based on your speed.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
