import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { addDiary, checkDiaryAvailability } from './api/api'; // Import the required functions

function AddDiary() {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Get token from local storage

  useEffect(() => {
    const checkDiaryAvailabilityAsync = async () => {
      if (date && token) {
        try {
          const checkData = await checkDiaryAvailability(date, token);
          console.log('Diary availability check response:', checkData);
          setIsDateAvailable(checkData.exists === false);
        } catch (error) {
          console.error('Error checking diary availability:', error);
          setIsDateAvailable(true); // Handle as available if there is an error
        }
      }
    };

    checkDiaryAvailabilityAsync();
  }, [date, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      alert('오늘 이후의 날짜로는 일기를 작성할 수 없습니다.');
      return;
    }

    if (!isDateAvailable) {
      alert('해당 날짜에 이미 작성된 일기가 있습니다.');
      return;
    }

    try {
      const savedDiary = await addDiary(date, title, diaryContent, oneLine, token);
      alert('일기가 성공적으로 저장되었습니다.');
      setDate('');
      setTitle('');
      setOneLine('');
      setDiaryContent('');
      navigate(`/detail-diary/${savedDiary.id}`);
    } catch (error) {
      console.error('Error saving diary:', error);
      alert('일기 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <br />
      <div className="addContainer container mt-5 border border-secondary rounded-3 p-5 pb-7 shadow p-3 text-center">
        <h1 className="titleName display-4 mt-4 fw-bold">
          <i className="addSpan bi bi-book"></i>
          오늘의 <span className="addSpan"> 일기</span>
        </h1>
        <br />
        <br />
        <form onSubmit={handleSubmit}>
          <div className="formdiv mb-3">
            <label htmlFor="DiaryAddDate" className="form-label">
              오늘 날짜
            </label>
            <input
              type="date"
              className="form-control"
              id="DiaryAddDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // 오늘 이후의 날짜 선택 불가
            />
            {!isDateAvailable && (
              <div className="text-danger">
                해당 날짜에 이미 작성된 일기가 있습니다.
              </div>
            )}
          </div>
          <div className="formdiv mb-3">
            <label htmlFor="DiaryTitle" className="form-label">
              일기 제목
            </label>
            <input
              type="text"
              className="form-control"
              id="DiaryTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="formdiv mb-3">
            <label htmlFor="DiaryOneLine" className="form-label">
              한줄평
            </label>
            <input
              type="text"
              className="form-control"
              id="DiaryOneLine"
              value={oneLine}
              onChange={(e) => setOneLine(e.target.value)}
            />
          </div>
          <div className="formdiv mb-3">
            <label htmlFor="todayDiary" className="form-label">
              오늘의 일기
            </label>
            <textarea
              className="form-control"
              id="todayDiary"
              rows="3"
              placeholder="오늘의 일기를 적어보세요."
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="Addbtn btn"
            disabled={!isDateAvailable}
          >
            저장하기
          </button>
        </form>
      </div>
      <div className="wise">
        <span className="wiseSpan">일기</span>를 쓴다는 것은 누구도 보지 않을
        책에 헌신할 만큼 자신의 삶이{' '}
        <span className="wiseSpan">가치가 있다</span>고 판단하는 것이다. <br />
        <br />-<span className="wiseSpan">아주 작은 반복의 힘</span>, 로버트
        마우어
      </div>
      <br />
      <br />
      <br />
    </>
  );
}

export default AddDiary;
