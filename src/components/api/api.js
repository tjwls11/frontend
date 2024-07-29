import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3011';

// 공통 요청 헤더
const getAuthHeaders = (token) => {
  if (!token) {
    console.error("토큰이 제공되지 않았습니다.");
    throw new Error("토큰이 필요합니다.");
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
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
  } else {
    throw new Error(message);
  }
};



// 무드 색상 설정
export const setMoodColor = async (date, color, token) => {
  try {
    await axios.post(`${API_URL}/set-mood-color`, { date, color }, getAuthHeaders(token));
  } catch (error) {
    handleError('무드 색상 설정 중 오류가 발생했습니다.', error);
  }
};

// 달력에 추가
export const addToCalendar = async (date, color, stickerId, token) => {
  try {
    await axios.post(`${API_URL}/add-to-calendar`, { date, color, stickerId }, getAuthHeaders(token));
  } catch (error) {
    handleError('달력에 추가하는 중 오류가 발생했습니다.', error);
  }
};


// 사용자 정보 가져오기
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

// 다이어리 추가
export const addDiary = async (date, title, content, one, token) => {
  try {
    await axios.post(`${API_URL}/add-diary`, { date, title, content, one }, getAuthHeaders(token));
  } catch (error) {
    handleError('다이어리 추가 중 오류가 발생했습니다.', error);
  }
};

// 다이어리 목록 조회
export const fetchDiaries = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-diaries`, getAuthHeaders(token));
    return response.data.diaries;
  } catch (error) {
    handleError('다이어리 목록 조회 중 오류가 발생했습니다.', error);
  }
};

// 다이어리 상세 조회
export const fetchDiary = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/get-diary/${id}`, getAuthHeaders(token));
    return response.data.diary;
  } catch (error) {
    handleError('다이어리 상세 조회 중 오류가 발생했습니다.', error);
  }
};

// 다이어리 삭제
export const deleteDiary = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/delete-diary/${id}`, getAuthHeaders(token));
  } catch (error) {
    handleError('다이어리 삭제 중 오류가 발생했습니다.', error);
  }
};

// 캘린더 항목 조회
export const fetchCalendarEntries = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-calendar`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleError('캘린더 항목을 가져오는 중 오류가 발생했습니다.', error);
  }
};
