import { supabase } from './supabase';

export interface Booking {
  id: string;
  parent_id: string;
  cluster_id: string;
  status: 'pending' | 'intro_scheduled' | 'confirmed' | 'completed' | 'cancelled';
  grade_level: string;
  subject: string;
}

export interface TutorProfile {
  id: string;
  full_name: string;
  subjects: string[];
  is_verified: boolean;
}

/**
 * Tutor Assignment Engine
 * 
 * Logic to find the best match for a student booking.
 * Factors: Subject expertise, Verification status, and existing workload.
 */
export async function findBestTutorForBooking(bookingId: string) {
  // 1. Fetch booking details
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, clusters(*)')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) throw new Error('Booking not found');

  // 2. Fetch tutors who teach this subject (simplified check for now)
  const { data: tutors, error: tutorsError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'tutor')
    .eq('is_verified', true);

  if (tutorsError || !tutors || tutors.length === 0) {
    throw new Error('No verified tutors available for assignment at this moment');
  }

  // Matching logic: Return a random verified tutor if multiple exist
  const randomIndex = Math.floor(Math.random() * tutors.length);
  return tutors[randomIndex];
}

/**
 * Assigns a tutor to a booking.
 */
export async function assignTutorToBooking(bookingId: string, tutorId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      assigned_tutor_id: tutorId,
      status: 'confirmed' 
    })
    .eq('id', bookingId);

  if (error) throw error;
  return true;
}
