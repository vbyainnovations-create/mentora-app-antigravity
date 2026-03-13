import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CreditCard, ArrowRight, BookOpen } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { PaymentModal } from '../../components/PaymentModal';
import { findBestTutorForBooking, assignTutorToBooking } from '../../lib/assignment-engine';
import { addDays, format, setHours, setMinutes } from 'date-fns';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cluster, setCluster] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(0); // Index for next 7 days
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [showPayment, setShowPayment] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
  const timeSlots = ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

  useEffect(() => {
    if (id) fetchCluster();
  }, [id]);

  async function fetchCluster() {
    setLoading(true);
    const { data } = await supabase.from('clusters').select('*').eq('id', id).single();
    if (data) setCluster(data);
    setLoading(false);
  }

  const handleBooking = async () => {
    if (!selectedTime) {
      Alert.alert('Selection Required', 'Please choose a time slot for your intro session.');
      return;
    }

    setShowPayment(true);
    setPaymentStatus('processing');

    // Simulate payment process
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. Create Booking record
        const { data: booking, error: bError } = await supabase
          .from('bookings')
          .insert({
            parent_id: user.id,
            cluster_id: id,
            status: 'pending'
          })
          .select()
          .single();

        if (bError) throw bError;

        // 2. Run Assignment Engine
        const bestTutor = await findBestTutorForBooking(booking.id);
        await assignTutorToBooking(booking.id, bestTutor.id);

        // 3. Create Session record
        const scheduledAt = addDays(new Date(), selectedDate + 1);
        // Simplified time parsing
        const [hourStr, rest] = selectedTime.split(':');
        const hour = parseInt(hourStr) + (selectedTime.includes('PM') && hourStr !== '12' ? 12 : 0);
        
        const sessionDate = setHours(setMinutes(scheduledAt, 0), hour);

        await supabase.from('sessions').insert({
          booking_id: booking.id,
          tutor_id: bestTutor.id,
          scheduled_at: sessionDate.toISOString(),
          status: 'scheduled'
        });

        setPaymentStatus('success');
      } catch (err: any) {
        console.error(err);
        setPaymentStatus('error');
      }
    }, 2000);
  };

  if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#194F8A" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <PaymentModal 
        visible={showPayment} 
        status={paymentStatus} 
        amount={cluster?.price || '0'} 
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          router.replace('/(tabs)/sessions');
        }}
      />

      <View className="px-6 py-4 flex-row items-center border-b border-slate-50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-xl bg-slate-50">
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-slate-900 mr-10" style={{ fontFamily: 'Outfit' }}>
          Schedule Intro Session
        </Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'Inter' }}>Selected Program</Text>
          <View className="bg-white border border-slate-100 rounded-[28px] p-6 flex-row items-center shadow-sm">
            <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mr-5">
              <BookOpen size={24} color="#065F46" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Outfit' }}>{cluster?.subject}</Text>
              <Text className="text-xs text-slate-500 font-medium uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>{cluster?.grade_level}</Text>
            </View>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center mr-3">
              <CalendarIcon size={16} color="#0F172A" />
            </View>
            <Text className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
            {dates.map((date, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(i)}
                className={`w-18 h-24 items-center justify-center rounded-[24px] mr-4 mb-2 shadow-sm ${
                  selectedDate === i ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100'
                }`}
                style={{ borderWidth: selectedDate === i ? 0 : 1 }}
              >
                <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${selectedDate === i ? 'text-slate-400' : 'text-slate-400'}`} style={{ fontFamily: 'Inter' }}>
                  {format(date, 'EEE')}
                </Text>
                <Text className={`text-xl font-bold ${selectedDate === i ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Outfit' }}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center mr-3">
              <Clock size={16} color="#0F172A" />
            </View>
            <Text className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>Available Slots</Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`px-6 py-4 rounded-2xl border ${
                  selectedTime === time ? 'bg-emerald-50 border-emerald-800/30 shadow-sm' : 'bg-white border-slate-100'
                }`}
              >
                <Text className={`font-semibold text-sm ${selectedTime === time ? 'text-emerald-900' : 'text-slate-600'}`} style={{ fontFamily: 'Inter' }}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mt-4 mb-28 bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
          {/* Decorative element */}
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-400 font-medium" style={{ fontFamily: 'Inter' }}>Intro Session Cost</Text>
            <Text className="text-white font-bold" style={{ fontFamily: 'Outfit' }}>₹0</Text>
          </View>
          <View className="flex-row justify-between mb-6 pb-6 border-b border-white/10">
            <Text className="text-slate-400 font-medium" style={{ fontFamily: 'Inter' }}>Commitment Deposit</Text>
            <Text className="text-white font-bold" style={{ fontFamily: 'Outfit' }}>₹500</Text>
          </View>
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Total Payable</Text>
            <Text className="text-3xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>₹500</Text>
          </View>

          <TouchableOpacity
            onPress={handleBooking}
            className="bg-white py-5 rounded-2xl flex-row items-center justify-center shadow-lg"
          >
            <CreditCard size={20} color="#0F172A" />
            <Text className="text-slate-900 font-bold text-lg ml-3" style={{ fontFamily: 'Inter' }}>Confirm & Pay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
