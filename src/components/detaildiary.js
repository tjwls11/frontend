import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.css'; // FontAwesome 사용
import { fetchDiary } from './api/api'; // API 함수 임포트

const DetailDiary = () => {
  const { id } = useParams(); // URL 파라미터에서 일기 ID 가져오기
  const [details, setDetails] = useState(null); // 일기 데이터를 저장할 상태 변수
  const [error, setError] = useState(null); // 에러를 저장할 상태 변수
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    const fetchDiaryDetails = async () => {
      const token = localStorage.getItem('token'); // 저장된 JWT 토큰 가져오기
      try {
        const data = await fetchDiary(id, token); // API 호출
        setDetails(data.diary); // 다이어리 데이터를 설정
      } catch (error) {
        console.error('다이어리 가져오기 오류:', error);
        setError('다이어리 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchDiaryDetails();
  }, [id]);

  if (loading) {
    return <div className="container mt-5">로딩 중...</div>;
  }

  if (error) {
    return <div className="container mt-5">오류: {error}</div>;
  }

  if (!details) {
    return <div className="container mt-5">일기를 찾을 수 없습니다.</div>;
  }

  // 날짜를 'yyyy-mm-dd' 형식으로 변환하는 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container mt-5 border border-secondary rounded-3 p-5 pb-7 shadow p-3 mb-5">
      <div className="header-container d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 fw-bold">
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ color: '#9ad6a8' }}
          ></i>
          그날의 <span style={{ color: '#9ad6a8' }}>일기</span>
        </h1>
        <Link
          to="/diary"
          className="btn btn-primary text-white text-decoration-none"
          style={{ backgroundColor: '#9ad6a8', borderColor: '#9ad6a8' }}
        >
          홈으로
        </Link>
      </div>
      <div id="book-detail" className="down">
        <div className="detail-item m-4 mt-5">
          <h2 className="fw-bold fs-3 mb-3">{details.title}</h2>
          <p className="text-muted">{formatDate(details.date)}</p> {/* 날짜 출력 */}
          <p>{details.content}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailDiary;
