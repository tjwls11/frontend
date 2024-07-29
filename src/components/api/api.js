import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3011';

// 사용자 정보 가져오기
export const fetchUserInfo = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user-info`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user info:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to fetch user information');
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword, token) => {
  try {
    await axios.post(`${API_URL}/change-password`, {
      currentPassword,
      newPassword,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error changing password:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to change password');
  }
};

// 다이어리 추가
export const addDiary = async (date, title, content, one, token) => {
  try {
    await axios.post(`${API_URL}/add-diary`, {
      date,
      title,
      content,
      one,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error adding diary:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to add diary');
  }
};

// 다이어리 목록 조회
export const fetchDiaries = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-diaries`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.diaries;
  } catch (error) {
    console.error('Error fetching diaries:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to fetch diaries');
  }
};

// 다이어리 상세 조회
export const fetchDiary = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/get-diary/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data.diary;
  } catch (error) {
    console.error('Error fetching diary:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to fetch diary');
  }
};

// 다이어리 삭제
export const deleteDiary = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/delete-diary/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting diary:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to delete diary');
  }
};

// 스티커 목록 가져오기
export const fetchUserStickers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/get-user-stickers`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('Fetched stickers data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stickers:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to fetch user stickers');
  }
};


// 스티커 추가
export const addSticker = async (name, imageUrl, token) => {
  try {
    await axios.post(`${API_URL}/add-sticker`, {
      name,
      imageUrl,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error adding sticker:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to add sticker');
  }
};

// 스티커 구매
export const buySticker = async (stickerId, token) => {
  try {
    const response = await axios.post(`${API_URL}/buy-sticker`, 
      { sticker_id: stickerId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error buying sticker:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to buy sticker');
  }
};;

// 캘린더에 스티커 추가
export const addToCalendar = async (date, color, stickerId, token) => {
  try {
    await axios.post(`${API_URL}/add-to-calendar`, {
      date,
      color,
      sticker_id: stickerId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error adding to calendar:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to add to calendar');
  }
};

// 날짜 범위에 따른 무드 색상 가져오기
export const fetchMoodRange = async (startDate, endDate, token) => {
  try {
    const response = await axios.get(`${API_URL}/get-mood-range`, {
      params: { startDate, endDate },
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching mood range:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to fetch mood range');
  }
};

// 특정 날짜의 무드 색상 설정
export const setMoodColor = async (date, color, token) => {
  try {
    await axios.post(`${API_URL}/set-mood`, {
      date,
      color,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error setting mood color:', error.response?.status, error.response?.data?.message || error.message);
    throw new Error('Failed to set mood color');
  }
};
