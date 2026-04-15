import { useEventStore } from '../../store/eventStore';

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings, updateSettings } = useEventStore();

  const handleThemeChange = (theme: 'pastelGray' | 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleAlarmToggle = () => {
    updateSettings({ alarmEnabled: !settings.alarmEnabled });
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
