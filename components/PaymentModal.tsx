import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, XCircle, ShieldCheck, CreditCard } from 'lucide-react-native';

interface PaymentModalProps {
  visible: boolean;
  status: 'processing' | 'success' | 'error';
  amount: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ visible, status, amount, onClose, onSuccess }: PaymentModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-white w-full rounded-3xl p-8 items-center shadow-2xl">
          {status === 'processing' && (
            <>
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
                <ActivityIndicator size="large" color="#194F8A" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit' }}>
                Processing Payment
              </Text>
              <Text className="text-gray-500 text-center mb-6" style={{ fontFamily: 'Inter' }}>
                Securely connecting to the payment gateway...
              </Text>
              <View className="flex-row items-center border-t border-gray-100 pt-6 w-full justify-center">
                <ShieldCheck size={16} color="#6B7280" />
                <Text className="text-xs text-gray-400 ml-2 uppercase font-bold tracking-widest" style={{ fontFamily: 'Inter' }}>
                  SSL SECURED
                </Text>
              </View>
            </>
          )}

          {status === 'success' && (
            <>
              <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                <CheckCircle2 size={40} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit' }}>
                Payment Successful!
              </Text>
              <Text className="text-gray-500 text-center mb-6" style={{ fontFamily: 'Inter' }}>
                Your intro session has been booked. A top educator is being matched to your child.
              </Text>
              <View className="bg-gray-50 w-full rounded-xl p-4 mb-8">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500" style={{ fontFamily: 'Inter' }}>Amount Paid</Text>
                  <Text className="font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>₹{amount}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500" style={{ fontFamily: 'Inter' }}>Transaction ID</Text>
                  <Text className="text-gray-900 font-medium" style={{ fontFamily: 'Inter' }}>#TRX-9482</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onSuccess}
                className="bg-[#194F8A] w-full py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg" style={{ fontFamily: 'Inter' }}>Continue to Sessions</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'error' && (
            <>
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
                <XCircle size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit' }}>
                Payment Failed
              </Text>
              <Text className="text-gray-500 text-center mb-8" style={{ fontFamily: 'Inter' }}>
                There was an issue processing your transaction. Please try again.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-900 w-full py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg" style={{ fontFamily: 'Inter' }}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
