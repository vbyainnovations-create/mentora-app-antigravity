import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function SessionsScreen() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, bookings!inner(*, clusters(*)), profiles:tutor_id(full_name), study_modules(*)')
        .eq('bookings.parent_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>My Sessions</Text>
        <Text className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter' }}>Track upcoming and past classes</Text>
      </View>

      <ScrollView className="px-6 pt-6">
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#0F172A" />
          </View>
        ) : sessions.length === 0 ? (
          <View className="bg-gray-50 rounded-2xl p-12 items-center border border-dashed border-gray-200">
            <Text className="text-gray-400 font-medium text-center" style={{ fontFamily: 'Inter' }}>
              No sessions found. Book a cluster to get started!
            </Text>
          </View>
        ) : (
          sessions.map((session, i) => (
            <View key={session.id} className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
              <View className="flex-row justify-between items-start mb-3">
                <View className={`px-2.5 py-1 rounded-md ${
                  session.status === 'scheduled' ? 'bg-slate-50 border border-slate-100' :
                  session.status === 'completed' ? 'bg-emerald-50 border border-emerald-100' :
                  'bg-red-50 border border-red-100'
                }`}>
                  <Text className={`text-xs font-bold uppercase tracking-wider ${
                    session.status === 'scheduled' ? 'text-slate-600' :
                    session.status === 'completed' ? 'text-emerald-800' :
                    'text-red-800'
                  }`} style={{ fontFamily: 'Inter' }}>
                    {session.status}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-gray-400" style={{ fontFamily: 'Inter' }}>ID: {session.id.substring(0, 8)}</Text>
              </View>

              <Text className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>
                {session.study_modules?.title || session.bookings?.clusters?.subject || 'Tutoring Session'}
              </Text>
              <Text className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Inter' }}>
                {session.study_modules ? `Module ${session.study_modules.order_index} Tracking` : `Grade: ${session.bookings?.clusters?.grade_level || 'N/A'}`}
              </Text>

              <View className="bg-gray-50 rounded-xl p-3 flex-row items-center mb-4 border border-gray-100">
                <Clock size={16} color="#4B5563" />
                <Text className="text-sm font-medium text-gray-700 ml-2" style={{ fontFamily: 'Inter' }}>
                  {format(new Date(session.scheduled_at), 'MMM d, h:mm a')}
                </Text>
              </View>

              <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: 'Inter' }}>Educator</Text>
                  <Text className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Inter' }}>
                    {session.profiles?.full_name || 'Matching...'}
                  </Text>
                </View>
                {session.status === 'ongoing' && (
                  <Link href={`/tracking/${session.id}`} asChild>
                    <TouchableOpacity className="bg-[#194F8A] px-4 py-2 rounded-lg">
                      <Text className="text-white font-bold text-sm" style={{ fontFamily: 'Inter' }}>Track Live</Text>
                    </TouchableOpacity>
                  </Link>
                )}
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
