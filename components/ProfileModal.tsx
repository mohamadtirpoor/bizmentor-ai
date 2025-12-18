import React, { useState } from 'react';
import { X, User, Mail, Crown, Edit2, Save, Camera, LogOut } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: { name: string; email: string } | null;
  hasPremium: boolean;
  freeMessagesUsed: number;
  onUpdateProfile: (data: { name: string; email: string }) => void;
  onLogout?: () => void;
  darkMode?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen, onClose, userData, hasPremium, freeMessagesUsed, onUpdateProfile, onLogout, darkMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');

  if (!isOpen || !userData) return null;

  const handleSave = () => {
    onUpdateProfile({ name, email });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <User className="w-5 h-5 text-purple-600" />
            پروفایل کاربری
          </h3>
          <button onClick={onClose} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-6 flex flex-col items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {userData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-500">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className={`mt-4 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.name}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData.email}</p>
          {hasPremium && (
            <div className="mt-2 flex items-center gap-1 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">کاربر Premium</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className={`block text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>نام و نام خانوادگی</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`} />
              </div>
              <div>
                <label className={`block text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ایمیل</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`} />
              </div>
            </>
          ) : (
            <>
              <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <User className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="mr-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>نام</p>
                  <p className={darkMode ? 'text-white' : 'text-gray-800'}>{userData.name}</p>
                </div>
              </div>
              <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Mail className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="mr-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>ایمیل</p>
                  <p className={darkMode ? 'text-white' : 'text-gray-800'} dir="ltr">{userData.email}</p>
                </div>
              </div>
              <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Crown className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="mr-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>وضعیت اشتراک</p>
                  <p className={hasPremium ? 'text-amber-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {hasPremium ? 'Premium فعال' : 'بدون اشتراک'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`p-6 border-t space-y-3 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl">
                <Save className="w-4 h-4" />ذخیره تغییرات
              </button>
              <button onClick={() => setIsEditing(false)} className={`px-6 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>انصراف</button>
            </div>
          ) : (
            <>
              <button onClick={() => { setName(userData.name); setEmail(userData.email); setIsEditing(true); }}
                className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-xl ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Edit2 className="w-4 h-4" />ویرایش پروفایل
              </button>
              {onLogout && (
                <button onClick={() => { onLogout(); onClose(); }}
                  className={`w-full flex items-center justify-center gap-2 py-3 font-medium rounded-xl ${darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                  <LogOut className="w-4 h-4" />خروج از حساب
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
