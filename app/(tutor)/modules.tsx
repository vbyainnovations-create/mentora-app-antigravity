import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

interface Module {
  id: string;
  title: string;
  covered: boolean;
}

interface ClusterData {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  totalModules: number;
  modules: Module[];
}

export default function ModulesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchModulesData();
  }, []);

  async function fetchModulesData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Fetch bookings for this tutor that are confirmed or completed
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          clusters (
            id,
            title,
            subject,
            grade_level,
            study_modules (
              id,
              title,
              order_index
            )
          )
        `)
        .eq('assigned_tutor_id', user.id)
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      } else if (bookings) {
        // 2. Fetch completed modules (sessions with module_id)
        const { data: completedSessions } = await supabase
          .from('sessions')
          .select('booking_id, module_id')
          .eq('status', 'completed')
          .not('module_id', 'is', null);

        const completedModuleIds = new Set(completedSessions?.map(s => s.module_id));

        const formattedClusters: ClusterData[] = bookings.map((b: any) => {
          const cluster = b.clusters;
          const modules = cluster.study_modules
            .sort((m1: any, m2: any) => m1.order_index - m2.order_index)
            .map((m: any) => ({
              id: m.id,
              title: m.title,
              covered: completedModuleIds.has(m.id)
            }));

          return {
            id: b.id, // Using booking ID as the key for the view
            title: cluster.title,
            subject: cluster.subject,
            grade_level: cluster.grade_level,
            totalModules: modules.length,
            modules: modules
          };
        });

        setClusters(formattedClusters);
        if (formattedClusters.length > 0 && !expanded) {
          setExpanded(formattedClusters[0].id);
        }
      }
    }
    setLoading(false);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchModulesData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
          Study Modules
        </Text>
        <Text className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter' }}>
          Track progress across your active clusters
        </Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <ScrollView 
          className="px-6 pt-5" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {clusters.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl p-12 items-center border border-dashed border-gray-200">
              <Text className="text-gray-400 font-medium text-center" style={{ fontFamily: 'Inter' }}>
                No active clusters found. Your assignments will appear here.
              </Text>
            </View>
          ) : (
            clusters.map((cluster) => {
              const covered = cluster.modules.filter((m) => m.covered).length;
              const progress = cluster.totalModules > 0 ? Math.round((covered / cluster.totalModules) * 100) : 0;
              const isOpen = expanded === cluster.id;

              return (
                <View
                  key={cluster.id}
                  className="bg-white border border-gray-200 rounded-2xl mb-5 shadow-sm overflow-hidden"
                >
                  {/* Cluster Header */}
                  <TouchableOpacity
                    onPress={() => setExpanded(isOpen ? null : cluster.id)}
                    className="p-5"
                  >
                    <View className="flex-row items-start">
                      <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                        <BookOpen size={22} color="#065F46" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1"
                          style={{ fontFamily: 'Inter' }}
                        >
                          {cluster.grade_level} · {cluster.subject}
                        </Text>
                        <Text
                          className="text-base font-bold text-gray-900 leading-tight mb-3"
                          style={{ fontFamily: 'Outfit' }}
                        >
                          {cluster.title}
                        </Text>

                        {/* Progress Bar */}
                        <View className="flex-row items-center">
                          <View className="flex-1 bg-gray-100 rounded-full h-2 mr-3">
                            <View
                              className="bg-[#0F172A] h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </View>
                          <Text
                            className="text-xs font-bold text-gray-600"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {covered}/{cluster.totalModules}
                          </Text>
                        </View>
                        <Text
                          className="text-xs text-gray-400 mt-1"
                          style={{ fontFamily: 'Inter' }}
                        >
                          {progress}% complete
                        </Text>
                      </View>
                      <View className="ml-3 mt-1">
                        {isOpen ? (
                          <ChevronUp size={20} color="#9CA3AF" />
                        ) : (
                          <ChevronDown size={20} color="#9CA3AF" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Module List */}
                  {isOpen && (
                    <View className="border-t border-gray-100">
                      {cluster.modules.map((mod, idx) => (
                        <View
                          key={mod.id}
                          className={`flex-row items-center px-5 py-3.5 ${
                            idx < cluster.modules.length - 1 ? 'border-b border-gray-50' : ''
                          }`}
                        >
                          {mod.covered ? (
                            <CheckCircle2 size={20} color="#065F46" fill="#ECFDF5" />
                          ) : (
                            <Circle size={20} color="#D1D5DB" />
                          )}
                          <View className="flex-1 ml-3">
                            <Text
                              className={`text-sm font-medium ${
                                mod.covered ? 'text-gray-400 line-through' : 'text-gray-800'
                              }`}
                              style={{ fontFamily: 'Inter' }}
                            >
                              {mod.title}
                            </Text>
                          </View>
                          <Text
                            className="text-xs font-bold text-gray-300 ml-2"
                            style={{ fontFamily: 'Inter' }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
