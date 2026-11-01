import { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { useAuthStore } from '../../store/authStore';
import { getNotificationPermission, requestNotificationPermission } from '../../utils/alarm';
import {
  getPushSupport,
  isPushActiveOnThisDevice,
  subscribePush,
  unsubscribePush,
  setPushEnabled,
  sendTestPush,
} from '../../lib/pushService';

const PERMISSION_LABEL: Record<string, string> = {
  granted: '허용됨',
  denied: '차단됨 (브라우저 설정에서 허용 필요)',
  default: '아직 요청 안 함',
  unsupported: '이 브라우저는 지원 안 함',
};

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings, updateSettings } = useEventStore();
  const { user } = useAuthStore();
  const [notifyPermission, setNotifyPermission] = useState(getNotificationPermission());
  const pushSupport = getPushSupport();
  const [pushActive, setPushActive] = useState(isPushActiveOnThisDevice());
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState('');

  const handleThemeChange = (theme: 'pastelGray' | 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleAlarmToggle = async () => {
    const next = !settings.alarmEnabled;
    updateSettings({ alarmEnabled: next });
    if (next) setNotifyPermission(await requestNotificationPermission());
    if (user && pushActive) {
      setPushEnabled(user.uid, next).catch((err) => console.error('Error updating push setting:', err));
    }
  };

  const handlePushToggle = async () => {
    if (!user || pushBusy) return;
    setPushBusy(true);
    setPushMessage('');
    try {
      if (pushActive) {
        await unsubscribePush(user.uid);
        setPushActive(false);
        setPushMessage('이 기기의 푸시 알림을 해제했습니다');
      } else {
        await subscribePush(user.uid);
        setPushActive(true);
        setPushMessage('이 기기에서 푸시 알림을 받습니다');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setPushMessage(
        message === 'permission-denied'
          ? '알림 권한이 허용되지 않았습니다. 설정에서 이 앱의 알림을 허용해주세요'
          : '푸시 알림 설정에 실패했습니다'
      );
    } finally {
      setNotifyPermission(getNotificationPermission());
      setPushBusy(false);
    }
  };

  const handlePushTest = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    setPushMessage('');
    try {
      const { sent } = await sendTestPush();
      setPushMessage(sent > 0 ? '테스트 알림을 보냈습니다. 잠시 후 도착합니다' : '보낼 수 있는 기기가 없습니다');
    } catch {
      setPushMessage('테스트 알림 발송에 실패했습니다');
    } finally {
      setPushBusy(false);
    }
  };

  const handleFontChange = (font: string) => {
    updateSettings({ fontFamily: font });
  };

  const handleClearData = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-pastel-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-pastel-700">관리자 설정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pastel-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 설정 옵션 */}
        <div className="p-4 space-y-6">
          {/* 테마 설정 */}
          <div>
            <h3 className="font-semibold text-pastel-700 mb-3">테마</h3>
            <div className="space-y-2">
              {[
                { value: 'pastelGray', label: '파스텔 그레이' },
                { value: 'light', label: '라이트' },
                { value: 'dark', label: '다크' },
              ].map(theme => (
                <label key={theme.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={settings.theme === theme.value}
                    onChange={() => handleThemeChange(theme.value as any)}
                    className="rounded-full"
                  />
                  <span className="text-pastel-700">{theme.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 알람 설정 */}
          <div className="border-t border-pastel-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-pastel-700">알람</h3>
                <p className="text-xs text-pastel-500 mt-1">
                  알람 기능을 활성화/비활성화합니다
                </p>
                <p className="text-xs text-pastel-500 mt-1">
                  브라우저 알림 권한: {PERMISSION_LABEL[notifyPermission]}
                </p>
              </div>
              <button
                onClick={handleAlarmToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.alarmEnabled ? 'bg-green-500' : 'bg-pastel-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.alarmEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 푸시 알림 설정 (서버 발송, 앱이 꺼져 있어도 도착) */}
          <div className="border-t border-pastel-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-pastel-700">푸시 알림</h3>
                <p className="text-xs text-pastel-500 mt-1">
                  앱이 꺼져 있어도 이 기기로 일정 알림을 받습니다
                </p>
              </div>
              {pushSupport === 'supported' && (
                <button
                  onClick={handlePushToggle}
                  disabled={pushBusy}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    pushActive ? 'bg-green-500' : 'bg-pastel-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
            </div>
            {pushSupport === 'ios-needs-home-screen' && (
              <p className="text-xs text-red-500 mt-2">
                아이폰은 Safari에서 공유 → '홈 화면에 추가'로 설치한 앱에서만 푸시 알림을 받을 수 있습니다 (iOS 16.4 이상)
              </p>
            )}
            {pushSupport === 'unsupported' && (
              <p className="text-xs text-red-500 mt-2">이 브라우저는 푸시 알림을 지원하지 않습니다</p>
            )}
            {pushActive && (
              <button
                onClick={handlePushTest}
                disabled={pushBusy}
                className="mt-3 px-3 py-1.5 text-xs border border-pastel-300 text-pastel-700 rounded-lg hover:bg-pastel-50 disabled:opacity-50"
              >
                테스트 알림 보내기
              </button>
            )}
            {pushMessage && <p className="text-xs text-pastel-600 mt-2">{pushMessage}</p>}
          </div>

          {/* 폰트 설정 */}
          <div className="border-t border-pastel-200 pt-6">
            <h3 className="font-semibold text-pastel-700 mb-3">폰트</h3>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full px-3 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
            >
              <option value="default">기본</option>
              <option value="sans">산스 세리프</option>
              <option value="serif">세리프</option>
              <option value="mono">모노</option>
            </select>
          </div>

          {/* 데이터 초기화 */}
          <div className="border-t border-pastel-200 pt-6">
            <button
              onClick={handleClearData}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              모든 데이터 초기화
            </button>
          </div>

          {/* 정보 */}
          <div className="border-t border-pastel-200 pt-6 text-center">
            <p className="text-xs text-pastel-500">
              Rara Calendar v1.0<br />
              <span className="text-pastel-400">로컬 저장소 기반</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
