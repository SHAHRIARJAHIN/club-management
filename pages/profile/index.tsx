import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import Layout from '@/components/ui/Layout';
import { Loader2, Upload, CheckCircle, XCircle } from 'lucide-react';
import { Database } from '@/types/supabase'; // Import your Database type

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  student_id: z.string().min(2, 'Student ID must be at least 2 characters'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number').optional().or(z.literal('')),
  department: z.string().min(2, 'Department must be at least 2 characters').optional().or(z.literal('')),
  batch: z.string().regex(/^\d{4}$/, 'Batch year must be 4 digits').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Profile extends Database['public']['Tables']['profiles']['Row'] {
  email?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty }, 
    setValue,
    reset
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const profileData = { ...data, email: user.email };
        setProfile(profileData);
        setAvatarUrl(data.photo_url);

        // Initialize form with profile data
        reset({
          full_name: data.full_name || '',
          student_id: data.student_id || '',
          phone: data.phone || '',
          department: data.department || '',
          batch: data.batch || '',
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    
    setUpdating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          student_id: data.student_id,
          phone: data.phone || null,
          department: data.department || null,
          batch: data.batch || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while updating your profile.');
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !event.target.files?.length) return;

    const file = event.target.files[0];
    setUploading(true);
    setErrorMessage(null);

    try {
      // Validate file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('Only JPG, PNG, and WEBP images are allowed');
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size must be less than 2MB');
      }

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSuccessMessage('Profile picture updated successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <Layout title="Profile | University Club Management">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading your profile...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Status Messages */}
            {(successMessage || errorMessage) && (
              <div className={`p-4 ${successMessage ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center">
                  {successMessage ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  )}
                  <p className={`text-sm ${successMessage ? 'text-green-700' : 'text-red-700'}`}>
                    {successMessage || errorMessage}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Avatar Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-2xl font-medium">
                            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-all ${
                        uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      title="Change profile picture"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{profile?.full_name}</h2>
                    <p className="text-gray-600">{profile?.email}</p>
                    {profile?.student_id && (
                      <p className="text-sm text-gray-500 mt-1">Student ID: {profile.student_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full_name">
                      Full Name *
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.full_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('full_name')}
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="student_id">
                      Student ID *
                    </label>
                    <input
                      id="student_id"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.student_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('student_id')}
                    />
                    {errors.student_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">
                      Department
                    </label>
                    <input
                      id="department"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('department')}
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="batch">
                      Batch Year (YYYY)
                    </label>
                    <input
                      id="batch"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.batch ? 'border-red-300' : 'border-gray-300'
                      }`}
                      {...register('batch')}
                    />
                    {errors.batch && (
                      <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating || !isDirty}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      updating || !isDirty ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient<Database>(context);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?returnUrl=/profile',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};