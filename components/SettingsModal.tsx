import React, { useState } from 'react';
import { X, Settings, Bell, Moon, Globe, Lock, Trash2, LogOut } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onDeleteAccount
}) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('fa');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            تنظیمات
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="p-6 space-y-6">
          {/* Appearance */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">ظاهر</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-400" />
                  <span className="text-white">حالت تاریک</span>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-white">زبان</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">اعلان‌ها</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-white">اعلان‌های پوش</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">امنیت</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-right">
                <Lock className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <span className="text-white block">تغییر رمز عبور</span>
                  <span className="text-xs text-gray-500">رمز عبور خود را تغییر دهید</span>
                </div>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">حساب کاربری</h4>
            <div className="space-y-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-right"
              >
                <LogOut className="w-5 h-5 text-orange-400" />
                <div className="flex-1">
                  <span className="text-orange-400 block">خروج از حساب</span>
                  <span className="text-xs text-gray-500">از حساب کاربری خود خارج شوید</span>
                </div>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-right"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <span className="text-red-400 block">حذف حساب کاربری</span>
                  <span className="text-xs text-red-400/60">این عمل غیرقابل بازگشت است</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-6 border-t border-white/10 bg-red-500/10">
            <p className="text-sm text-red-300 mb-4">
              آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟ تمام داده‌های شما پاک خواهد شد.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteAccount();
                  onClose();
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
              >
                بله، حذف کن
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">بیزنس‌متر نسخه ۱.۰.۰</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
