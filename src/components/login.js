import React, { useState, useEffect } from 'react';
import { useLogin } from '../context/LoginContext';
import { useNavigate, Link } from 'react-router-dom';
import background1 from '../images/background1.jpg';
import background2 from '../images/background2.jpg';
import background3 from '../images/background3.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({ user_id: '', password: '' });
  const [loginError, setLoginError] = useState(''); // 로그인 오류 상태 추가
  const { login } = useLogin();
  const navigate = useNavigate();

  // 랜덤 배경 이미지 설정
  useEffect(() => {
    const backgrounds = [
      background1,
      background2,
      background3,
    ];

    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.style.backgroundImage = `url(${randomBackground})`;
    document.body.style.backgroundSize = 'cover'; // 배경 이미지 크기 조절
    document.body.style.backgroundPosition = 'center'; // 배경 이미지 위치 설정
    document.body.style.backgroundAttachment = 'fixed'; // 배경 이미지 고정

    // 컴포넌트 언마운트 시 배경 이미지 초기화
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    };
  }, []); // 빈 배열로 처음 렌더링 시 한 번만 실행

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // 로그인 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // 로그인 시 오류 초기화

    try {
      const response = await fetch('https://43.200.233.44:3011/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.user, data.token); // 로그인 성공 시 상태 업데이트
        navigate('/calendar'); // 성공 시 이동
      } else {
        setLoginError(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  };

  // 폼 유효성 검사
  const isFormValid = credentials.user_id && credentials.password;

  return (
    <div className="page">
      <div className="title-login">LOGIN</div>
      <form className="content" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          name="user_id"
          placeholder="ID"
          value={credentials.user_id}
          onChange={handleChange}
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
        />
        <button
          className={`login-button ${isFormValid ? 'enabled' : 'disabled'}`}
          disabled={!isFormValid}
          type="submit"
        >
          로그인
        </button>
      </form>
      {loginError && <p className="error-message">{loginError}</p>}
      <div className="actions">
        <Link to="/signup" className="signup-link">회원가입</Link>
      </div>
    </div>
  );
};

export default Login;
