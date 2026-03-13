import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function TrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (id) {
      fetchSession();
      
      // Subscribe to real-time changes
      const channel = supabase
        .channel(`session_tracking_${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${id}` },
          (payload) => {
            setSession(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (session?.status === 'ongoing' && session?.start_time) {
      interval = setInterval(() => {
        const start = new Date(session.start_time).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        setElapsedTime(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session]);

  async function fetchSession() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*, bookings(clusters(*)), profiles:tutor_id(full_name), study_modules(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      setSession(data);
    }
    setLoading(false);
  }

  if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#194F8A" />
    </View>
  );

  if (!session) return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-gray-500 font-medium">Session not found</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-4">
        <Text className="text-[#194F8A] font-bold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-50">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10" style={{ fontFamily: 'Outfit' }}>
          Live Tracking
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Status Badge */}
          <View className="items-center mb-8">
            <View className={`px-4 py-2 rounded-full flex-row items-center ${
              session.status === 'ongoing' ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                session.status === 'ongoing' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <Text className={`text-sm font-bold uppercase tracking-wider ${
                session.status === 'ongoing' ? 'text-amber-800' : 'text-emerald-800'
              }`} style={{ fontFamily: 'Inter' }}>
                {session.status === 'ongoing' ? 'Session is Live' : 'Session Completed'}
              </Text>
            </View>
          </View>

          {/* Timer Display */}
          <View className="bg-[#0F172A] rounded-[48px] p-12 items-center mb-10 shadow-2xl shadow-blue-500/20 overflow-hidden relative">
            {/* Background Decorative Element */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full" />
            
            <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-[6px] mb-6" style={{ fontFamily: 'Inter' }}>
              SESSION DURATION
            </Text>
            <Text className="text-white text-7xl font-bold tracking-tighter" style={{ fontFamily: 'Outfit' }}>
              {session.status === 'ongoing' ? elapsedTime : '--:--:--'}
            </Text>
            
            <View className="mt-10 flex-row items-center bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-3 shadow-sm shadow-blue-500" />
              <Text className="text-blue-100 text-sm font-semibold" style={{ fontFamily: 'Inter' }}>
                Started at {session.start_time ? format(new Date(session.start_time), 'h:mm a') : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Session Details Card */}
          <View className="bg-white border border-gray-100 rounded-[32px] p-8 mb-8 shadow-sm">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6" style={{ fontFamily: 'Inter' }}>
              Your Educator
            </Text>
            <View className="flex-row items-center mb-8">
              <View className="w-16 h-16 bg-[#194F8A] rounded-2xl items-center justify-center mr-5 shadow-lg shadow-blue-900/10">
                <Text className="text-white font-bold text-2xl" style={{ fontFamily: 'Outfit' }}>
                  {(session.profiles?.full_name || 'E').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>
                  {session.profiles?.full_name || 'Educator'}
                </Text>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-[#31975B] mr-2" />
                  <Text className="text-sm text-gray-500 font-medium" style={{ fontFamily: 'Inter' }}>
                    Verified Expert
                  </Text>
                </View>
              </View>
            </View>

            <View className="h-[1px] bg-gray-50 mb-8" />

            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6" style={{ fontFamily: 'Inter' }}>
              Current Cluster
            </Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-5">
                <CheckCircle2 size={24} color="#31975B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
                  {session.study_modules?.title || session.bookings?.clusters?.subject || 'Tutoring Session'}
                </Text>
                <Text className="text-sm text-gray-500 font-medium" style={{ fontFamily: 'Inter' }}>
                  {session.study_modules ? `Module ${session.study_modules.order_index}: Curriculum-Aligned` : 'Curriculum-Aligned Learning'}
                </Text>
              </View>
            </View>
          </View>

          {/* Help Area */}
          <TouchableOpacity className="flex-row items-center justify-center bg-gray-50 py-4 rounded-2xl border border-gray-100">
            <AlertCircle size={18} color="#6B7280" />
            <Text className="text-gray-600 font-bold ml-2" style={{ fontFamily: 'Inter' }}>
              Report an Issue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
