import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const LoginScreen: React.FC = () => {
  const { signUpWithEmail, signInWithEmail, resetPassword, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resetSending, setResetSending] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setNotice('');

    if (!email.trim()) {
      setError('비밀번호를 찾을 이메일을 먼저 입력해주세요');
      return;
    }

    setResetSending(true);
    try {
      await resetPassword(email.trim());
      setNotice('비밀번호 재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인해주세요');
    } catch (err) {
      const errorCode = (err as { code?: string })?.code || '';
      if (errorCode === 'auth/invalid-email') {
        setError('올바른 이메일 형식이 아닙니다');
      } else if (errorCode === 'auth/user-not-found') {
        setError('가입되지 않은 이메일입니다');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요');
      } else {
        setError('재설정 메일 발송에 실패했습니다');
      }
    } finally {
      setResetSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      const errorCode = err?.code || '';
      if (errorCode === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다');
      } else if (errorCode === 'auth/invalid-email') {
        setError('올바른 이메일 형식이 아닙니다');
      } else if (errorCode === 'auth/user-not-found') {
        setError('가입되지 않은 이메일입니다');
      } else if (errorCode === 'auth/wrong-password') {
        setError('비밀번호가 맞지 않습니다');
      } else if (errorCode === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 맞지 않습니다');
      } else if (errorCode === 'auth/weak-password') {
        setError('비밀번호가 너무 약합니다');
      } else {
        setError(isSignUp ? '가입에 실패했습니다' : '로그인에 실패했습니다');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pastel-100 to-pastel-200 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pastel-700 mb-2">🗓️</h1>
          <h2 className="text-2xl font-bold text-pastel-800 mb-1">Rara Calendar</h2>
          <p className="text-pastel-600 text-sm">
            {isSignUp ? '계정을 만들어 시작하세요' : '로그인해서 시작하세요'}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
              disabled={loading}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-pastel-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full px-4 py-2 border border-pastel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
              disabled={loading}
            />
            {/* 비밀번호 찾기 (로그인 모드에서만) */}
            {!isSignUp && (
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading || resetSending}
                  className="text-xs text-pastel-600 hover:underline disabled:opacity-50"
                >
                  {resetSending ? '메일 보내는 중...' : '비밀번호를 잊으셨나요?'}
                </button>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 안내 메시지 */}
          {notice && (
            <div className="p-3 bg-pastel-50 border border-pastel-200 rounded-lg text-pastel-700 text-sm">
              {notice}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pastel-500 text-white rounded-lg font-semibold hover:bg-pastel-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : isSignUp ? '가입' : '로그인'}
          </button>
        </form>

        {/* 탭 전환 */}
        <div className="mt-6 text-center text-sm text-pastel-600">
          {isSignUp ? (
            <>
              계정이 있으신가요?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setNotice('');
                  setEmail('');
                  setPassword('');
                }}
                className="font-semibold text-pastel-700 hover:underline"
              >
                로그인
              </button>
            </>
          ) : (
            <>
              계정이 없으신가요?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                  setNotice('');
                  setEmail('');
                  setPassword('');
                }}
                className="font-semibold text-pastel-700 hover:underline"
              >
                가입
              </button>
            </>
          )}
        </div>

        {/* 테스트 계정 안내 */}
        <div className="mt-8 p-4 bg-pastel-50 rounded-lg text-xs text-pastel-600 border border-pastel-100">
          <p className="font-semibold mb-2">💡 테스트 하려면:</p>
          <p>이메일: test@example.com</p>
          <p>비밀번호: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
