import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
    } else {
      // Auth listener in _layout.tsx will handle redirection
    }
  }

  // Development bypass to test specific portals
  const testLogin = (role: 'parent' | 'tutor') => {
    if (role === 'tutor') {
      router.replace('/(tutor)');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-12">
          <View className="items-center mb-12">
            <View className="w-32 h-32 items-center justify-center mb-6">
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </View>
            <Text className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 text-center" style={{ fontFamily: 'Outfit' }}>
              Structured Learning
            </Text>
            <Text className="text-slate-600 text-center px-8 text-base leading-relaxed" style={{ fontFamily: 'Inter' }}>
              Parent-facing platform for Class 6–12 & competitive prep
            </Text>
          </View>

          <View className="space-y-5 mb-10">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 ml-1" style={{ fontFamily: 'Inter' }}>Email Address</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <Mail size={18} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 text-slate-900 font-medium"
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 ml-1" style={{ fontFamily: 'Inter' }}>Password</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <Lock size={18} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 text-slate-900 font-medium"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={signInWithEmail}
            disabled={loading}
            className={`w-full bg-[#0F172A] rounded-2xl py-5 flex-row justify-center items-center shadow-lg shadow-slate-900/20 ${loading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg mr-2" style={{ fontFamily: 'Inter' }}>
              {loading ? 'Verifying...' : 'Sign In'}
            </Text>
            {!loading && <ArrowRight size={20} color="white" />}
          </TouchableOpacity>

          <View className="mt-14">
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-[1px] bg-slate-100" />
              <Text className="mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter' }}>Development Access</Text>
              <View className="flex-1 h-[1px] bg-slate-100" />
            </View>
            
            <View className="flex-row justify-between gap-4">
              <TouchableOpacity 
                onPress={() => testLogin('parent')}
                className="flex-1 bg-emerald-50 border border-emerald-800/20 rounded-2xl p-4 items-center group"
              >
                <Text className="text-emerald-900 font-bold text-sm" style={{ fontFamily: 'Inter' }}>Parent Portal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => testLogin('tutor')}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 items-center"
              >
                <Text className="text-slate-900 font-bold text-sm" style={{ fontFamily: 'Inter' }}>Tutor Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
