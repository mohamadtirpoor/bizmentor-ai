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
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fa');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            تنظیمات
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="p-6 space-y-6">
          {/* Appearance */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">ظاهر</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">حالت تاریک</span>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">زبان</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-gray-700 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">اعلان‌ها</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">اعلان‌های پوش</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">امنیت</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-right">
                <Lock className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <span className="text-gray-700 block">تغییر رمز عبور</span>
                  <span className="text-xs text-gray-400">رمز عبور خود را تغییر دهید</span>
                </div>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">حساب کاربری</h4>
            <div className="space-y-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-right"
              >
                <LogOut className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <span className="text-orange-500 block">خروج از حساب</span>
                  <span className="text-xs text-gray-400">از حساب کاربری خود خارج شوید</span>
                </div>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors text-right"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <span className="text-red-500 block">حذف حساب کاربری</span>
                  <span className="text-xs text-red-400">این عمل غیرقابل بازگشت است</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-6 border-t border-gray-100 bg-red-50">
            <p className="text-sm text-red-600 mb-4">
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
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">بیزنس‌متر نسخه ۱.۰.۰</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
