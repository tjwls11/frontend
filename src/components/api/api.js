import axios from 'axios';

// 기본 API URL
const API_URL = process.env.API_URL || 'http://localhost:3011';

// 공통 요청 헤더
const getAuthHeaders = (token) => {
  if (!token) {
    console.error('토큰이 제공되지 않았습니다.');
    throw new Error('토큰이 제공되지 않았습니다.');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 공통 에러 핸들러
const handleError = (message, error) => {
  const status = error.response?.status;
  const errorMessage = error.response?.data?.message || error.message;

  console.error(`${message} - Status: ${status}, Message: ${errorMessage}`);

  if (status === 401) {
    throw new Error("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
  } else if (status === 403) {
    throw new Error("접근 권한이 없습니다.");
  } else {
    throw new Error(message);
  }
};

// 회원가입
export const signup = async (name, userId, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { name, user_id: userId, password });
    return response.data;
  } catch (error) {
    handleError('회원가입 중 오류가 발생했습니다.', error);
  }
};

// 로그인
export const login = async (userId, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { user_id: userId, password });
    return response.data;
  } catch (error) {
    handleError('로그인 중 오류가 발생했습니다.', error);
  }
};

// 사용자 정보 조회
export const fetchUserInfo = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-user-info`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('사용자 정보 요청 중 오류가 발생했습니다.', error);
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword, token) => {
  try {
    const response = await axios.post(`${API_URL}/change-password`, { currentPassword, newPassword }, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('비밀번호 변경 중 오류가 발생했습니다.', error);
  }
};

// 다이어리 관련
export const fetchDiaries = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-diaries`, getAuthHeaders(token));
    return response.data.diaries;
  } catch (error) {
    handleError('다이어리 목록 조회 중 오류가 발생했습니다.', error);
  }
};

export const fetchDiary = async (id, token) => {
  const response = await fetch(`http://localhost:3011/get-diary/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Fetched diary:', data); // 데이터 구조 확인을 위해 콘솔에 출력
  return data;
};


export const addDiary = async (date, title, content, one, token) => {
  try {
    const response = await axios.post(`${API_URL}/add-diary`, { date, title, content, one }, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('다이어리 추가 중 오류가 발생했습니다.', error);
  }
};

export const deleteDiary = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/delete-diary/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('다이어리 삭제 중 오류가 발생했습니다.', error);
  }
};

// 다이어리 수정
export const editDiary = async (id, diaryData, token) => {
  const url = `http://localhost:3011/edit-diary/${id}`;
  try {
    const response = await axios.put(url, diaryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`다이어리 수정 중 오류가 발생했습니다. - Status: ${error.response?.status}, Message: ${error.message}`);
  }
};


// 날짜별 다이어리 체크 API 호출
export const checkDiaryAvailability = async (date, token) => {
  try {
    const response = await axios.get(`${API_URL}/checkDiary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
      },
    });
    return response.data;
  } catch (error) {
    handleError('다이어리 날짜 확인 중 오류가 발생했습니다.', error);
  }
};

// 색상 저장 API 호출
export const setMoodColor = async (date, color, token) => {
  try {
    const response = await axios.post(`${API_URL}/set-mood-color`, { date, color }, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('무드 색상 설정 중 오류가 발생했습니다.', error);
  }
};

// 색상 조회 API 호출
export const fetchUserCalendar = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-user-calendar`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('캘린더 데이터 조회 중 오류가 발생했습니다.', error);
  }
};

// 프로필 사진 업로드
export const uploadProfilePicture = async (formData, token) => {
  try {
    const response = await axios.post(`${API_URL}/upload-profile-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleError('프로필 사진 업로드 중 오류가 발생했습니다.', error);
  }
};
