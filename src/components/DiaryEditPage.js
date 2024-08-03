import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDiary, checkDiaryAvailability, editDiary } from './api/api';

const DiaryEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState({ title: '', date: '', content: '' });
  const [error, setError] = useState('');

  const token = localStorage.getItem('token'); // 예: localStorage에서 토큰을 가져오는 방법

  const fetchDiaryData = useCallback(async () => {
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }
    
    try {
      const data = await fetchDiary(id, token);
      
      // 날짜를 yyyy-MM-dd 포맷으로 변환
      const formattedDate = new Date(data.date).toISOString().split('T')[0];
      setDiary({ ...data, date: formattedDate });
    } catch (error) {
      console.error('Error fetching diary:', error);
      setError('일기 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [id, token]);

  useEffect(() => {
    fetchDiaryData();
  }, [fetchDiaryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDiary({ ...diary, [name]: value });
  };

  const handleSaveEdit = async () => {
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      // Check if a diary entry already exists for the selected date
      const existingDiary = await checkDiaryAvailability(diary.date, token);

      if (existingDiary.length > 0 && existingDiary[0].id !== id) {
        setError('해당 날짜에 이미 일기가 존재합니다.');
        return;
      }

      // Proceed to update the diary entry
      await editDiary(id, diary, token);
      navigate('/'); // Navigate to the desired page after successful update
    } catch (error) {
      console.error('Error editing diary:', error);
      setError('일기 정보를 저장하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>일기 수정</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            제목
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={diary.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">
            날짜
          </label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={diary.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            내용
          </label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            value={diary.content}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveEdit}
        >
          수정
        </button>
      </form>
    </div>
  );
};

export default DiaryEditPage;
