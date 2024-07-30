// src/api/api.js
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3011';

// 공통 요청 헤더
export const getAuthHeaders = (token) => {
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

// 캘린더에 이벤트 추가
export const addToCalendar = async (eventData, token) => {
  try {
    // eventData가 객체인지 확인
    if (typeof eventData !== 'object' || eventData === null) {
      throw new Error('eventData는 객체여야 합니다.');
    }

    // 필수 필드 확인
    const { date, color } = eventData;
    if (!date || !color) {
      throw new Error('필수 필드가 누락되었습니다: date와 color를 제공해야 합니다.');
    }

    const response = await axios.post(`${API_URL}/api/calendar`, eventData, getAuthHeaders(token));
    console.log('Event added to calendar:', response.data);
  } catch (error) {
    console.error('Error adding event to calendar:', error.message);
    if (error.response && error.response.status === 403) {
      console.error('Access denied: You do not have permission to perform this action.');
    }
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
    const response = await axios.post(`${API_URL}/add-diary`, { date, title, content, one }, getAuthHeaders(token));
    return response.data;
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
    const response = await axios.delete(`${API_URL}/delete-diary/${id}`, getAuthHeaders(token));
    return response.data;
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

// 모든 스티커 조회 (인증 필요)
export const fetchStickers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-stickers`, getAuthHeaders(token));
    return response.data.stickers;
  } catch (error) {
    handleError('스티커 목록 조회 중 오류가 발생했습니다.', error);
  }
};

// 사용자 스티커 목록 조회
export const fetchUserStickers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-user-stickers`, getAuthHeaders(token));
    return response.data.stickers;
  } catch (error) {
    handleError('사용자 스티커 목록 조회 중 오류가 발생했습니다.', error);
  }
};

// 스티커 구매
export const buySticker = async (token, stickerId) => {
  try {
    const response = await axios.post(`${API_URL}/buy-sticker`, { sticker_id: stickerId }, getAuthHeaders(token));
    return response;
  } catch (error) {
    handleError('스티커 구매 중 오류가 발생했습니다.', error);
  }
};

// 사용자 로그아웃
export const logoutUser = async (token) => {
  try {
    await axios.post(`${API_URL}/logout`, {}, getAuthHeaders(token));
  } catch (error) {
    handleError('로그아웃 중 오류가 발생했습니다.', error);
  }
};

// 알림 설정
export const setNotification = async (notifications, token) => {
  try {
    await axios.post(`${API_URL}/set-notification`, { notifications }, getAuthHeaders(token));
  } catch (error) {
    handleError('알림 설정 중 오류가 발생했습니다.', error);
  }
};

// 비밀번호 재설정
export const resetPassword = async (email) => {
  try {
    await axios.post(`${API_URL}/reset-password`, { email });
  } catch (error) {
    handleError('비밀번호 재설정 중 오류가 발생했습니다.', error);
  }
};

// 스티커 카테고리 조회
export const fetchStickerCategories = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-sticker-categories`, getAuthHeaders(token));
    return response.data.categories;
  } catch (error) {
    handleError('스티커 카테고리 조회 중 오류가 발생했습니다.', error);
  }
};

