import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Star, BookOpen, CalendarCheck } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [recommendedClusters, setRecommendedClusters] = useState<any[]>([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Fetch next session for parent (either ongoing or soonest scheduled)
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*, bookings!inner(*, clusters(*)), profiles:tutor_id(full_name), study_modules(*)')
        .eq('bookings.parent_id', user.id)
        .in('status', ['ongoing', 'scheduled'])
        .order('status', { ascending: false }) // 'ongoing' comes before 'scheduled' alphabetically? No, 'o' vs 's'. 'ongoing' is first. Or use custom order.
        .order('scheduled_at', { ascending: true })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setUpcomingSession(sessions[0]);
      }

      // Fetch recommended clusters
      const { data: clusters } = await supabase
        .from('clusters')
        .select('*')
        .limit(5);
      
      if (clusters) {
        setRecommendedClusters(clusters);
      }
    }
    setLoading(false);
  }

  const userName = user?.user_metadata?.full_name || 'Parent';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <View className="w-32 h-32 mr-4">
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </View>
            <View>
              <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1" style={{ fontFamily: 'Inter' }}>Welcome back,</Text>
              <Text className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>{userName}</Text>
            </View>
          </View>
          <View className="w-11 h-11 rounded-full bg-slate-900 items-center justify-center shadow-sm">
            <Text className="text-white font-bold text-base" style={{ fontFamily: 'Outfit' }}>{userInitials}</Text>
          </View>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#0F172A" />
          </View>
        ) : (
          <>
            {/* Active Session Card */}
            {upcomingSession && (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
                    {upcomingSession.status === 'ongoing' ? 'Live Session' : 'Next Session'}
                  </Text>
                  <View className={`${upcomingSession.status === 'ongoing' ? 'bg-red-50 border-red-800/20' : 'bg-emerald-50 border-emerald-800/20'} px-3 py-1 rounded-full border`}>
                    <Text className={`${upcomingSession.status === 'ongoing' ? 'text-red-900' : 'text-emerald-900'} text-[10px] font-bold uppercase tracking-wider`} style={{ fontFamily: 'Inter' }}>
                      {upcomingSession.status === 'ongoing' ? 'Live Now' : 'Active'}
                    </Text>
                  </View>
                </View>
                
                <View className="bg-slate-900 rounded-[32px] p-7 shadow-xl shadow-slate-900/20 overflow-hidden relative">
                  {/* Decorative element */}
                  <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
                  
                  <View className="flex-row justify-between items-start mb-6">
                    <View>
                      <View className="flex-row items-center mb-1">
                        <CalendarCheck size={14} color="#94A3B8" />
                        <Text className="text-slate-300 text-[10px] font-bold uppercase tracking-widest ml-1.5" style={{ fontFamily: 'Inter' }}>
                          {format(new Date(upcomingSession.scheduled_at), 'MMM d, h:mm a')}
                        </Text>
                      </View>
                      <Text className="text-white text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        {upcomingSession.study_modules?.title || upcomingSession.bookings?.clusters?.subject}
                      </Text>
                      {upcomingSession.study_modules && (
                        <Text className="text-slate-400 text-xs mt-1" style={{ fontFamily: 'Inter' }}>
                          Module {upcomingSession.study_modules.order_index}: Curriculum Tracking
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="border-t border-white/10 pt-6 mt-2 flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center mr-3">
                        <Text className="text-white font-bold text-sm" style={{ fontFamily: 'Outfit' }}>
                          {(upcomingSession.profiles?.full_name || 'E').charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white font-semibold text-sm" style={{ fontFamily: 'Inter' }}>{upcomingSession.profiles?.full_name || 'Educator'}</Text>
                        <Text className="text-slate-400 text-[10px]" style={{ fontFamily: 'Inter' }}>Verified Expert</Text>
                      </View>
                    </View>
                    <Link href={`/tracking/${upcomingSession.id}`} asChild>
                      <TouchableOpacity className={`${upcomingSession.status === 'ongoing' ? 'bg-red-600' : 'bg-white'} rounded-xl px-5 py-2.5`}>
                        <Text className={`${upcomingSession.status === 'ongoing' ? 'text-white' : 'text-slate-900'} font-bold text-sm`} style={{ fontFamily: 'Inter' }}>
                          {upcomingSession.status === 'ongoing' ? 'Track Live' : 'Details'}
                        </Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>
            )}

            {/* Recommended Clusters */}
            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>Explore Clusters</Text>
                <TouchableOpacity>
                  <Text className="text-emerald-800 font-bold text-xs uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {recommendedClusters.length === 0 ? (
                <View className="bg-slate-50 rounded-3xl p-10 items-center border border-dashed border-slate-200">
                  <Text className="text-slate-400 font-medium" style={{ fontFamily: 'Inter' }}>No clusters available yet</Text>
                </View>
              ) : (
                recommendedClusters.map((cluster, idx) => (
                  <Link key={cluster.id} href={`/clusters/${cluster.id}`} asChild>
                    <TouchableOpacity className="bg-white border border-slate-100 rounded-[28px] p-5 mb-5 shadow-sm flex-row items-center active:bg-slate-50 transition-colors">
                      <View className="w-16 h-16 bg-emerald-50 rounded-[20px] items-center justify-center mr-5">
                        <BookOpen size={24} color="#065F46" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>{cluster.grade_level}</Text>
                          <View className="mx-2 w-1 h-1 rounded-full bg-slate-200" />
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>Verified</Text>
                        </View>
                        <Text className="text-lg font-semibold text-slate-900 mb-2 leading-tight" style={{ fontFamily: 'Outfit' }}>{cluster.subject}</Text>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-slate-900 font-bold text-base" style={{ fontFamily: 'Inter' }}>₹{cluster.price}</Text>
                          <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text className="text-xs font-bold text-slate-700 ml-1.5" style={{ fontFamily: 'Inter' }}>4.9</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
