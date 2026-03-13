import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, TrendingUp, UserCheck, ChevronRight, CheckCircle2, X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function TutorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Upcoming', count: 0, color: '#0F172A', bg: '#F8FAFC', status: 'scheduled' },
    { label: 'Ongoing', count: 0, color: '#D97706', bg: '#FFFBEB', status: 'ongoing' },
    { label: 'Completed', count: 0, color: '#065F46', bg: '#ECFDF5', status: 'completed' },
  ]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pendingAssignment, setPendingAssignment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [earnings, setEarnings] = useState({
    sessionsThisWeek: 0,
    estimatedPayout: 0,
    monthTotal: 0,
  });

  // Module Selection State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [fetchingModules, setFetchingModules] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function acceptAssignment(bookingId: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error accepting assignment:', error);
      return;
    }
    
    fetchDashboardData();
  }

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*, bookings(id, clusters(id, title, subject, price, tutor_commission_rate, study_modules(id, title, order_index)))')
        .eq('tutor_id', user.id);

      if (!error && sessions) {
        const counts = {
          scheduled: sessions.filter(s => s.status === 'scheduled').length,
          ongoing: sessions.filter(s => s.status === 'ongoing').length,
          completed: sessions.filter(s => s.status === 'completed').length,
        };

        setStats([
          { label: 'Upcoming', count: counts.scheduled, color: '#0F172A', bg: '#F8FAFC', status: 'scheduled' },
          { label: 'Ongoing', count: counts.ongoing, color: '#D97706', bg: '#FFFBEB', status: 'ongoing' },
          { label: 'Completed', count: counts.completed, color: '#065F46', bg: '#ECFDF5', status: 'completed' },
        ]);
        
        const completedSessions = sessions.filter(s => s.status === 'completed');
        let totalEarnings = 0;
        
        completedSessions.forEach(s => {
          const cluster = s.bookings?.clusters;
          if (cluster) {
            const commission = (cluster.price * (cluster.tutor_commission_rate || 70)) / 100;
            totalEarnings += commission;
          }
        });

        setEarnings({
          sessionsThisWeek: completedSessions.length,
          estimatedPayout: Math.round(totalEarnings),
          monthTotal: Math.round(totalEarnings),
        });

        const upcoming = sessions
          .filter(s => s.status === 'scheduled')
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        
        setUpcomingSessions(upcoming);

        const { data: pending } = await supabase
          .from('bookings')
          .select('*, clusters(*)')
          .eq('status', 'confirmed')
          .eq('assigned_tutor_id', user.id)
          .limit(1);

        if (pending && pending.length > 0) {
          setPendingAssignment({
            booking_id: pending[0].id,
            parent_name: 'Parent',
            subject: pending[0].clusters?.subject,
          });
        } else {
          setPendingAssignment(null);
        }
      }
    }
    setLoading(false);
  }

  const handleOpenCheckIn = (session: any) => {
    setSelectedSessionId(session.id);
    const modules = session.bookings?.clusters?.study_modules || [];
    setAvailableModules(modules.sort((a: any, b: any) => a.order_index - b.order_index));
    setShowModuleModal(true);
  };

  const handleCheckIn = async (moduleId: string) => {
    if (!selectedSessionId) return;

    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'ongoing',
        start_time: new Date().toISOString(),
        module_id: moduleId
      })
      .eq('id', selectedSessionId);

    if (error) {
      Alert.alert('Error', 'Failed to start session');
      console.error(error);
    } else {
      setShowModuleModal(false);
      fetchDashboardData();
      Alert.alert('Success', 'Session started! Parents can now track progress live.');
    }
  };

  const tutorName = user?.user_metadata?.full_name || 'Tutor';
  const tutorInitials = tutorName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

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
              <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1" style={{ fontFamily: 'Inter' }}>
                Good evening,
              </Text>
              <Text className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
                {tutorName}
              </Text>
            </View>
          </View>
          <View className="w-11 h-11 rounded-full bg-slate-900 items-center justify-center shadow-sm">
            <Text className="text-white font-bold text-base" style={{ fontFamily: 'Outfit' }}>
              {tutorInitials}
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#0F172A" />
          </View>
        ) : (
          <>
            {/* Assignment Request */}
            {pendingAssignment && (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>New Assignment</Text>
                  <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-800/20">
                    <Text className="text-emerald-900 text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Inter' }}>Action Required</Text>
                  </View>
                </View>
                
                <View className="bg-white border border-slate-200 rounded-[32px] p-7 shadow-sm">
                  <View className="flex-row items-center mb-6">
                    <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
                      <UserCheck size={24} color="#065F46" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter' }}>Student Request</Text>
                      <Text className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>{pendingAssignment.parent_name}'s Ward</Text>
                    </View>
                  </View>

                  <View className="bg-slate-50 rounded-2xl p-5 mb-6">
                    <Text className="text-slate-600 font-medium text-sm leading-relaxed" style={{ fontFamily: 'Inter' }}>
                      Mentora Academic Team has allocated you to the <Text className="text-slate-900 font-bold">{pendingAssignment.subject}</Text> cluster for this student.
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => acceptAssignment(pendingAssignment.booking_id)}
                    className="w-full bg-slate-900 rounded-2xl py-4 items-center shadow-lg shadow-slate-900/20"
                  >
                    <Text className="text-white font-bold text-base" style={{ fontFamily: 'Inter' }}>Accept Assignment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Today's Summary */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit' }}>
                Today's Overview
              </Text>
              <View className="flex-row gap-3">
                {stats.map((s) => (
                  <View
                    key={s.label}
                    className="flex-1 rounded-2xl p-4 items-center border border-gray-100"
                    style={{ backgroundColor: s.bg }}
                  >
                    <Text
                      className="text-3xl font-bold mb-1"
                      style={{ fontFamily: 'Outfit', color: s.color }}
                    >
                      {s.count}
                    </Text>
                    <Text
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ fontFamily: 'Inter', color: s.color }}
                    >
                      {s.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Upcoming Sessions */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
                  Upcoming Sessions
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-sm font-bold text-[#065F46]" style={{ fontFamily: 'Inter' }}>
                    Full Schedule
                  </Text>
                  <ChevronRight size={16} color="#065F46" />
                </TouchableOpacity>
              </View>

              {upcomingSessions.length === 0 ? (
                <View className="bg-gray-50 rounded-2xl p-8 items-center border border-dashed border-gray-200">
                  <Text className="text-gray-400 font-medium" style={{ fontFamily: 'Inter' }}>No upcoming sessions assigned</Text>
                </View>
              ) : (
                upcomingSessions.slice(0, 3).map((session) => (
                  <View
                    key={session.id}
                    className="bg-white border border-slate-100 rounded-[28px] p-6 mb-5 shadow-sm"
                  >
                    <View className="flex-row justify-between items-center mb-4">
                      <View className="flex-row items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                        <Clock size={12} color="#475569" />
                        <Text
                          className="text-[10px] font-bold text-slate-600 ml-1.5 uppercase tracking-wider"
                          style={{ fontFamily: 'Inter' }}
                        >
                          {format(new Date(session.scheduled_at), 'MMM d, h:mm a')}
                        </Text>
                      </View>
                      <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-800/20">
                        <Text className="text-emerald-900 text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Inter' }}>Scheduled</Text>
                      </View>
                    </View>

                    <Text
                      className="text-lg font-semibold text-slate-900 mb-2 leading-tight"
                      style={{ fontFamily: 'Outfit' }}
                    >
                      {session.bookings?.clusters?.subject || 'Tutoring Session'}
                    </Text>
                    
                    <View className="flex-row items-center mb-5">
                      <View className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
                      <Text className="text-xs text-slate-400 font-medium" style={{ fontFamily: 'Inter' }}>
                        Ref: {session.id.substring(0, 8).toUpperCase()}
                      </Text>
                    </View>

                    <View className="border-t border-slate-50 pt-5 flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-100">
                          <UserCheck size={18} color="#475569" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>Booking</Text>
                          <Text className="text-xs text-slate-900 font-semibold" style={{ fontFamily: 'Inter' }}>#{session.booking_id.substring(0, 8)}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleOpenCheckIn(session)}
                        className="bg-emerald-800 px-5 py-2.5 rounded-xl"
                      >
                        <Text
                          className="text-white font-bold text-xs"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Check In
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Earnings Card */}
        <View className="mb-10">
          <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit' }}>
            Earnings & Growth
          </Text>
          <View className="bg-[#0F172A] rounded-[32px] p-7 shadow-xl shadow-slate-900/20">
            <View className="flex-row items-center mb-3">
              <View className="bg-white/10 p-2 rounded-lg">
                <TrendingUp size={18} color="#93C5FD" />
              </View>
              <Text
                className="text-blue-100 text-xs font-bold uppercase tracking-widest ml-3"
                style={{ fontFamily: 'Inter' }}
              >
                Estimate This Week
              </Text>
            </View>
            <Text
              className="text-white text-4xl font-bold mb-6"
              style={{ fontFamily: 'Outfit' }}
            >
              ₹{earnings.estimatedPayout}
            </Text>
            <View className="border-t border-white/10 pt-6 flex-row justify-between items-center">
              <View>
                <Text className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter' }}>
                  Classes Done
                </Text>
                <Text
                  className="text-white font-bold text-lg"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {earnings.sessionsThisWeek}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter' }}>
                  Month Total
                </Text>
                <Text
                  className="text-white font-bold text-lg"
                  style={{ fontFamily: 'Outfit' }}
                >
                   ₹{earnings.monthTotal}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Module Selection Modal */}
      <Modal
        visible={showModuleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModuleModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit' }}>Identify Module</Text>
                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: 'Inter' }}>Which part of the cluster are you covering?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModuleModal(false)} className="w-10 h-10 bg-slate-50 items-center justify-center rounded-full">
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableModules.length === 0 ? (
                <Text className="text-slate-400 text-center py-10" style={{ fontFamily: 'Inter' }}>No modules defined for this cluster.</Text>
              ) : (
                availableModules.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => handleCheckIn(m.id)}
                    className="flex-row items-center p-5 bg-slate-50 rounded-2xl mb-4 border border-slate-100"
                  >
                    <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-4 border border-slate-200">
                      <Text className="text-slate-900 font-bold text-xs">{m.order_index}</Text>
                    </View>
                    <Text className="flex-1 text-slate-900 font-semibold" style={{ fontFamily: 'Inter' }}>{m.title}</Text>
                    <ChevronRight size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))
              )}
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
