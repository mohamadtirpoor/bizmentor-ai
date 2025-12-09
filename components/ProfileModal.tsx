import React, { useState } from 'react';
import { X, User, Mail, Crown, Calendar, Edit2, Save, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: { name: string; email: string } | null;
  hasPremium: boolean;
  freeMessagesUsed: number;
  onUpdateProfile: (data: { name: string; email: string }) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  hasPremium,
  freeMessagesUsed,
  onUpdateProfile
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            پروفایل کاربری
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30">
              {userData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-500 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">{userData.name}</h2>
          <p className="text-sm text-gray-400">{userData.email}</p>
          {hasPremium && (
            <div className="mt-2 flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">کاربر Premium</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  dir="ltr"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">نام</p>
                    <p className="text-white">{userData.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">ایمیل</p>
                    <p className="text-white" dir="ltr">{userData.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">وضعیت اشتراک</p>
                    <p className={hasPremium ? 'text-amber-400' : 'text-gray-300'}>
                      {hasPremium ? 'Premium فعال' : `رایگان (${freeMessagesUsed}/1 پیام)`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
              >
                <Save className="w-4 h-4" />
                ذخیره تغییرات
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
              >
                انصراف
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setName(userData.name);
                setEmail(userData.email);
                setIsEditing(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4" />
              ویرایش پروفایل
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
