import React, { useState, useEffect, memo } from 'react';
import { 
  format,startOfMonth,endOfMonth,startOfWeek,endOfWeek,addDays,isSameDay, 
  isSameMonth,subMonths,addMonths,startOfYear,endOfYear,eachMonthOfInterval,setMonth, 
  setYear} from 'date-fns';
import { fetchMoodRange, fetchUserStickers } from './api/api';

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

// 달력 헤더 렌더링
const RenderHeader = memo(({ currentMonth, setCurrentMonth, isEditingMonth, setIsEditingMonth, isEditingYear, setIsEditingYear, inputMonth, setInputMonth, inputYear, setInputYear, handleMonthChange, handleYearChange, toggleYearlyView, isYearlyView }) => (
  <div className="calendar-header">
    <button className="prev-button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>◀</button>
    <div className="month-year-container">
      {isEditingYear ? (
        <input
          type="number"
          value={inputYear}
          onChange={(e) => setInputYear(e.target.value)}
          onBlur={handleYearChange}
          onKeyDown={(e) => e.key === 'Enter' && handleYearChange()}
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
          onBlur={handleMonthChange}
          onKeyDown={(e) => e.key === 'Enter' && handleMonthChange()}
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
    <button className="yearly-view-button" onClick={toggleYearlyView}>
      {isYearlyView ? '월별 보기' : '연간 보기'}
    </button>
  </div>
));

// 요일 렌더링
const RenderDays = memo(() => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="days">
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

// 연간 보기 렌더링
const RenderYearView = ({ currentYear, setCurrentYear, setCurrentMonth, toggleYearlyView }) => {
  const yearStart = startOfYear(currentYear);
  const yearEnd = endOfYear(currentYear);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const handleMonthClick = (month) => {
    setCurrentMonth(month);  // 클릭한 월로 이동
    toggleYearlyView();  // 연간 보기 모드 종료
  };

  return (
    <div className="year-view">
      <div className="year-header">
        <span>{format(currentYear, 'yyyy년')}</span>
        <button onClick={toggleYearlyView}>월별 보기</button>
      </div>
      <div className="months-container">
        {months.map(month => (
          <div className="monthly-calendar" key={month.getMonth()} onClick={() => handleMonthClick(month)}>
            {format(month, 'M월')}
          </div>
        ))}
      </div>
    </div>
  );
};

// 메인 캘린더 컴포넌트
function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
  const [moodColors, setMoodColors] = useState(loadFromLocalStorage('moodColors', {}));
  const [stickers, setStickers] = useState(loadFromLocalStorage('stickers', []));
  const [selectedDate, setSelectedDate] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M'));
  const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy'));
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [isYearlyView, setIsYearlyView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API calls
        const moodData = await fetchMoodRange();
        setMoodColors(moodData || {});
        const stickerData = await fetchUserStickers();
        setStickers(stickerData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error.message);
      }
    };

    fetchData();
  }, [currentMonth]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowColorPicker(true);  // 색상 선택기 표시
  };

  const handleColorChange = (color) => {
    if (selectedDate) {
      const updatedMoodColors = { ...moodColors, [format(selectedDate, 'yyyy-MM-dd')]: color };
      setMoodColors(updatedMoodColors);
      saveToLocalStorage('moodColors', updatedMoodColors);
    }
    setShowColorPicker(false);
  };

  const handleStickerChange = (sticker) => {
    if (selectedDate) {
      const updatedStickers = [...stickers, { ...sticker, date: format(selectedDate, 'yyyy-MM-dd') }];
      setStickers(updatedStickers);
      saveToLocalStorage('stickers', updatedStickers);
    }
    setShowStickerPicker(false);
  };

  const handleMonthChange = () => {
    setCurrentMonth(setMonth(currentMonth, parseInt(inputMonth, 10) - 1));
    setIsEditingMonth(false);
  };

  const handleYearChange = () => {
    setCurrentYear(setYear(currentYear, parseInt(inputYear, 10)));
    setCurrentMonth(setYear(setMonth(currentMonth, format(currentMonth, 'M') - 1), parseInt(inputYear, 10)));
    setIsEditingYear(false);
  };

  const toggleYearlyView = () => {
    setIsYearlyView(!isYearlyView);
  };

  return (
    <div className="calendar-container">
      {isYearlyView ? (
        <RenderYearView
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          setCurrentMonth={setCurrentMonth}
          toggleYearlyView={toggleYearlyView}
        />
      ) : (
        <>
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
            handleMonthChange={handleMonthChange}
            handleYearChange={handleYearChange}
            toggleYearlyView={toggleYearlyView}
            isYearlyView={isYearlyView}
          />
          <RenderDays />
          <RenderCells
            currentMonth={currentMonth}
            moodColors={moodColors}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            stickers={stickers}
          />
        </>
      )}
      {showColorPicker && (
        <div className="color-picker">
          {colors.map(color => (
            <div
              key={color}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      )}
      {showStickerPicker && (
        <div className="sticker-picker">
          {/* 스티커 선택기 UI 구현 */}
          <button onClick={() => setShowStickerPicker(false)}>닫기</button>
          {/* 예제 스티커 옵션 */}
          <div className="sticker-option" onClick={() => handleStickerChange({ sticker_id: '1', image_url: 'path/to/sticker1.png', name: 'Sticker 1' })}>
            Sticker 1
          </div>
          <div className="sticker-option" onClick={() => handleStickerChange({ sticker_id: '2', image_url: 'path/to/sticker2.png', name: 'Sticker 2' })}>
            Sticker 2
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
