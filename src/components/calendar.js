import React, { useState, useEffect, memo } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isAfter, setMonth, setYear } from 'date-fns';
import { fetchMoodRange, setMoodColor, fetchUserStickers, addToCalendar } from './api/api';

// 색상 배열
const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

// 로컬 스토리지에서 데이터 로드
const loadFromLocalStorage = (key, defaultValue) => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

// 로컬 스토리지에 데이터 저장
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 캘린더 헤더 렌더링
const RenderHeader = memo(({ currentMonth, setCurrentMonth, isEditingMonth, setIsEditingMonth, isEditingYear, setIsEditingYear, inputMonth, setInputMonth, inputYear, setInputYear, handleMonthChange, handleYearChange }) => (
  <div className="calendar-header">
    <button className="prev-button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>◀</button>
    <div className="month-year-container">
      {isEditingYear ? (
        <input
          type="number"
          value={inputYear}
          onChange={(e) => setInputYear(e.target.value)}
          onBlur={handleYearChange}  // 호출
          onKeyDown={(e) => e.key === 'Enter' && handleYearChange()}  // 호출
          autoFocus
          className="month-year-input"
        />
      ) : (
        <span className="month-year" onClick={() => setIsEditingYear(true)}>
          {format(currentMonth, 'yyyy년')}
        </span>
      )}
      {isEditingMonth ? (
        <input
          type="number"
          value={inputMonth}
          onChange={(e) => setInputMonth(e.target.value)}
          onBlur={handleMonthChange}  // 호출
          onKeyDown={(e) => e.key === 'Enter' && handleMonthChange()}  // 호출
          autoFocus
          className="month-year-input"
        />
      ) : (
        <span className="month-year" onClick={() => setIsEditingMonth(true)}>
          {format(currentMonth, 'M월')}
        </span>
      )}
    </div>
    <button className="next-button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
  </div>
));

// 요일 렌더링
const RenderDays = memo(() => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="days row">
      {dayLabels.map((label, i) => (
        <div className="col" key={i}>
          {label}
        </div>
      ))}
    </div>
  );
});

// 셀 렌더링
const RenderCells = memo(({ currentMonth, moodColors, onDateClick, selectedDate, stickers }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let day = startDate;

  while (day <= endDate) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = day;
      const dayKey = format(currentDay, 'yyyy-MM-dd');
      const dayColor = moodColors[dayKey] || 'transparent';

      days.push(
        <div
          className={`cell ${!isSameMonth(currentDay, monthStart) ? 'disabled' : isSameDay(currentDay, new Date()) ? 'today' : isSameDay(currentDay, selectedDate) ? 'selected' : 'valid'}`}
          key={dayKey}
          onClick={() => onDateClick(currentDay)}
          style={{ backgroundColor: dayColor }}
        >
          {format(currentDay, 'd')}
          {stickers
            .filter(sticker => sticker.date === dayKey)
            .map(sticker => (
              <div key={sticker.sticker_id} className="sticker">
                <img src={sticker.image_url} alt={sticker.name} />
              </div>
            ))
          }
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(<div className="row" key={format(day, 'yyyy-MM-dd')}>{days}</div>);
  }

  return <div className="body">{rows}</div>;
});

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [moodColors, setMoodColors] = useState(() => loadFromLocalStorage('moodColors', {}));
  const [stickers, setStickers] = useState(() => loadFromLocalStorage('stickers', []));
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M'));
  const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy'));

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const colorsFromServer = await fetchMoodRange(startDate, endDate, token);

        if (colorsFromServer) {
          const moodData = colorsFromServer.moods.reduce((acc, mood) => {
            acc[mood.date] = mood.color;
            return acc;
          }, {});
          setMoodColors(moodData);
          saveToLocalStorage('moodColors', moodData);
        }
      } catch (error) {
        console.error('Failed to fetch mood colors:', error.message);
      }

      try {
        const stickersFromServer = await fetchUserStickers(token);
        setStickers(stickersFromServer.stickers || []);
        saveToLocalStorage('stickers', stickersFromServer.stickers || []);
      } catch (error) {
        console.error('Failed to fetch stickers:', error.message);
        setStickers([]);
        saveToLocalStorage('stickers', []);
      }
    };

    fetchData();
  }, [currentMonth, token]);

  const goToToday = () => setCurrentMonth(startOfMonth(new Date()));

  const onDateClick = (day) => {
    if (!isAfter(day, new Date())) {
      setSelectedDate(day);
      setShowColorPicker(true);
    }
  };

  const handleColorClick = async (color) => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const newMoodColors = { ...moodColors, [dateKey]: color };
      setMoodColors(newMoodColors);
      saveToLocalStorage('moodColors', newMoodColors);

      try {
        await setMoodColor(dateKey, color, token);
      } catch (error) {
        console.error('Failed to save mood color:', error.message);
      }
      setShowStickerPicker(true);
    }
  };

  const handleStickerClick = async (stickerId) => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      try {
        await addToCalendar(dateKey, moodColors[dateKey] || 'transparent', stickerId, token);
        alert('Sticker added to the date!');
      } catch (error) {
        console.error('Failed to add sticker:', error.message);
      }
      setShowColorPicker(false);
      setShowStickerPicker(false);
    }
  };

  const handleMonthChange = () => {
    const newMonth = parseInt(inputMonth, 10);
    if (newMonth >= 1 && newMonth <= 12) {
      setCurrentMonth(setMonth(currentMonth, newMonth - 1));
      setIsEditingMonth(false);
    }
  };

  const handleYearChange = () => {
    const newYear = parseInt(inputYear, 10);
    if (newYear >= 1900) {
      setCurrentMonth(setYear(currentMonth, newYear));
      setIsEditingYear(false);
    }
  };

  return (
    <div className="calendar">
      <RenderHeader
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        isEditingMonth={isEditingMonth}
        setIsEditingMonth={setIsEditingMonth}
        isEditingYear={isEditingYear}
        setIsEditingYear={setIsEditingYear}
        inputMonth={inputMonth}
        setInputMonth={setInputMonth}
        inputYear={inputYear}
        setInputYear={setInputYear}
        handleMonthChange={handleMonthChange}  // 전달
        handleYearChange={handleYearChange}    // 전달
      />
      <RenderDays />
      <RenderCells 
        currentMonth={currentMonth} 
        moodColors={moodColors} 
        onDateClick={onDateClick} 
        selectedDate={selectedDate}
        stickers={stickers}
      />
      {showColorPicker && (
        <div className="color-picker">
          <div className="color-options">
            {colors.map((color, index) => (
              <div
                key={index}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => handleColorClick(color)}
              />
            ))}
          </div>
          {showStickerPicker && (
            <div className="sticker-picker">
              {stickers.map((sticker) => (
                <div key={sticker.sticker_id} className="sticker-option" onClick={() => handleStickerClick(sticker.sticker_id)}>
                  <img src={sticker.image_url} alt={sticker.name} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <button onClick={goToToday} className="today-button">Today</button>
    </div>
  );
}

export default Calendar;
