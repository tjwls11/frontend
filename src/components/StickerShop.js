import React, { useState, useEffect } from 'react';
import { fetchStickers, fetchUserStickers, buySticker } from './api/api';


const StickerShop = () => {
  const [stickers, setStickers] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token'); // 로컬 저장소에서 토큰 가져오기

  useEffect(() => {
    const loadStickers = async () => {
      try {
        if (!token) {
          throw new Error('토큰이 제공되지 않았습니다.');
        }

        const allStickers = await fetchStickers(token);
        setStickers(allStickers || []);
        
        const ownedStickers = await fetchUserStickers(token);
        setUserStickers(ownedStickers || []);
        localStorage.setItem('userStickers', JSON.stringify(ownedStickers || [])); // 로컬 저장소에 저장
      } catch (error) {
        console.error('스티커를 가져오는 중 오류가 발생했습니다.', error);
        setError('스티커를 가져오는 중 오류가 발생했습니다.');
      }
    };
  
    loadStickers();
  }, [token]);

  const handleBuySticker = async (stickerId) => {
    try {
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await buySticker(token, stickerId); // 구매 API 호출
      if (response.status === 200) {
        alert('스티커 구매 성공!');
        // 구매 후 사용자 스티커 목록 업데이트
        const updatedUserStickers = await fetchUserStickers(token);
        setUserStickers(updatedUserStickers || []);
        localStorage.setItem('userStickers', JSON.stringify(updatedUserStickers || [])); // 로컬 저장소에 저장
      } else {
        alert('스티커 구매 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('스티커 구매 중 오류가 발생했습니다.', error);
      alert('스티커 구매 중 오류 발생');
    }
  };

  return (
    <div className="sticker-shop">
      <h1>스티커 샵</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="sticker-list">
        {stickers.map(sticker => (
          <div key={sticker.sticker_id} className="sticker-item">
            <img src={sticker.image_url} alt={sticker.name} className="sticker-image" />
            <div className="sticker-info">
              <h2>{sticker.name}</h2>
              <p>가격: {sticker.price} 코인</p>
              <button
                disabled={!token || userStickers.some(userSticker => userSticker.sticker_id === sticker.sticker_id)}
                onClick={() => handleBuySticker(sticker.sticker_id)}
              >
                {userStickers.some(userSticker => userSticker.sticker_id === sticker.sticker_id) ? '소유함' : '구매하기'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickerShop;
