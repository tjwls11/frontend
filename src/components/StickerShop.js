import React, { useEffect, useState } from 'react';
import { fetchUserStickers, buySticker } from './api/api';

const StickerShop = () => {
  const [stickers, setStickers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken') || '';

  useEffect(() => {
    const loadStickers = async () => {
      setLoading(true); // 로딩 시작
      console.log('Loading stickers with token:', token);
      try {
        const response = await fetchUserStickers(token);
        console.log('Stickers response:', response);
        
        if (response.isSuccess) {
          setStickers(response.stickers || []);
          setError(null); // 에러 초기화
        } else {
          setError('Failed to load stickers. Please try again later.');
        }
      } catch (err) {
        setError('An error occurred while fetching stickers.');
        console.error('Fetch stickers error:', err);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    if (token) {
      loadStickers();
    } else {
      setError('No authentication token available.');
      setLoading(false); // 로딩 종료
    }
  }, [token]);

  const handleBuySticker = async (stickerId) => {
    try {
      const response = await buySticker(stickerId, token);
      if (response.isSuccess) {
        alert('Sticker purchased successfully!');
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert('An error occurred while purchasing the sticker.');
      console.error('Buy sticker error:', err);
    }
  };

  return (
    <div>
      <h1>Sticker Shop</h1>
      {loading ? (
        <p>Loading stickers...</p> // 로딩 중 표시
      ) : (
        <>
          {error && <p>{error}</p>}
          <ul>
            {stickers.length > 0 ? (
              stickers.map((sticker) => (
                <li key={sticker.sticker_id}>
                  <img 
                    src={sticker.image_url} 
                    alt={sticker.name} 
                    style={{ width: '100px', height: '100px' }} 
                    onError={(e) => { e.target.src = 'default-image-url.png'; }} // 기본 이미지 설정
                  />
                  <p>{sticker.name}</p>
                  <p>{sticker.price} coins</p>
                  <button onClick={() => handleBuySticker(sticker.sticker_id)}>Buy</button>
                </li>
              ))
            ) : (
              <p>No stickers available.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default StickerShop;
