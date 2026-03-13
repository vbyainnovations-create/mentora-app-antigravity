import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CheckCircle2, PlayCircle, XCircle, BookOpen } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

const days = ['Today', 'Tomorrow', 'This Week'];

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  scheduled: {
    label: 'Scheduled',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  ongoing: {
    label: 'Ongoing',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  completed: {
    label: 'Completed',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#B91C1C',
    bg: '#FEF2F2',
    border: '#FECACA',
  },
};

export default function ScheduleScreen() {
  const [activeDay, setActiveDay] = useState(0);
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
        .select('*, bookings(clusters(subject))')
        .eq('tutor_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (!error && data) {
        setSessions(data);
      }
    }
    setLoading(false);
  }

  const handleCheckIn = async (id: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'ongoing', start_time: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', 'Could not check in. Please try again.');
    } else {
      fetchSessions();
    }
  };

  const handleCheckOut = async (id: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', 'Could not check out. Please try again.');
    } else {
      fetchSessions();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
          My Schedule
        </Text>
        <Text className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter' }}>
          Manage and track your sessions
        </Text>
      </View>

      {/* Day Tabs */}
      <View className="flex-row bg-gray-50 mx-6 mt-5 p-1 rounded-xl border border-gray-200">
        {days.map((day, idx) => (
          <TouchableOpacity
            key={day}
            onPress={() => setActiveDay(idx)}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeDay === idx ? 'bg-[#194F8A]' : ''
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                activeDay === idx ? 'text-white' : 'text-gray-500'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="px-6 pt-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#194F8A" />
          </View>
        ) : sessions.length === 0 ? (
          <View className="bg-gray-50 rounded-2xl p-12 items-center border border-dashed border-gray-200">
            <Text className="text-gray-400 font-medium text-center" style={{ fontFamily: 'Inter' }}>
              No sessions scheduled for this period.
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const cfg = statusConfig[session.status] || statusConfig.scheduled;
            return (
              <View
                key={session.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm"
              >
                {/* Top row */}
                <View className="flex-row justify-between items-center mb-4">
                  <View
                    className="px-2.5 py-1 rounded-md border"
                    style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                  >
                    <Text
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ fontFamily: 'Inter', color: cfg.color }}
                    >
                      {cfg.label}
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-bold text-gray-400"
                    style={{ fontFamily: 'Inter' }}
                  >
                    ID: {session.id.substring(0, 8)}
                  </Text>
                </View>

                {/* Subject */}
                <Text
                  className="text-base font-bold text-gray-900 mb-1"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {session.bookings?.clusters?.subject || 'Tutoring Session'}
                </Text>

                {/* Module */}
                <View className="flex-row items-center mb-4">
                  <BookOpen size={14} color="#6B7280" />
                  <Text
                    className="text-sm text-gray-500 ml-1.5"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Ref: {session.booking_id.substring(0, 8)}
                  </Text>
                </View>

                {/* Time + Parent */}
                <View className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Clock size={15} color="#4B5563" />
                    <Text
                      className="text-sm font-medium text-gray-700 ml-2"
                      style={{ fontFamily: 'Inter' }}
                    >
                      {format(new Date(session.scheduled_at), 'h:mm a')}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-bold text-gray-600"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {format(new Date(session.scheduled_at), 'MMM d')}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="border-t border-gray-100 pt-4 flex-row gap-3">
                  {session.status === 'scheduled' && (
                    <TouchableOpacity
                      onPress={() => handleCheckIn(session.id)}
                      className="flex-1 bg-[#194F8A] py-3 rounded-xl flex-row items-center justify-center"
                    >
                      <PlayCircle size={18} color="#fff" />
                      <Text
                        className="text-white font-bold ml-2"
                        style={{ fontFamily: 'Inter' }}
                      >
                        Check In
                      </Text>
                    </TouchableOpacity>
                  )}
                  {session.status === 'ongoing' && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleCheckOut(session.id)}
                        className="flex-1 bg-emerald-600 py-3 rounded-xl flex-row items-center justify-center"
                      >
                        <CheckCircle2 size={18} color="#fff" />
                        <Text
                          className="text-white font-bold ml-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Check Out
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="bg-gray-100 px-4 py-3 rounded-xl flex-row items-center justify-center border border-gray-200">
                        <XCircle size={18} color="#6B7280" />
                        <Text
                          className="text-gray-600 font-bold ml-2"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {session.status === 'completed' && (
                    <View className="flex-1 py-3 rounded-xl flex-row items-center justify-center bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 size={18} color="#047857" />
                      <Text
                        className="font-bold ml-2"
                        style={{ fontFamily: 'Inter', color: '#047857' }}
                      >
                        Session Completed
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
