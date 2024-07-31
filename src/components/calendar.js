import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, isSameMonth, isSameDay, startOfMonth,
    endOfMonth, startOfWeek, endOfWeek, addDays, isAfter, setMonth,
    setYear, startOfYear, endOfYear, eachMonthOfInterval, addYears, subYears
} from 'date-fns';

function Calendar() {
    // 색상 배열
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

    // 상태 정의
    const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 월
    const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
    const [moodColors, setMoodColors] = useState({}); // 기분 색상
    const [moodStickers, setMoodStickers] = useState({}); // 기분 스티커
    const [showColorPicker, setShowColorPicker] = useState(false); // 색상 선택기 표시 상태
    const [showStickerPicker, setShowStickerPicker] = useState(false); // 스티커 선택기 표시 상태
    const [today, setToday] = useState(new Date()); // 오늘 날짜
    const [isEditingMonth, setIsEditingMonth] = useState(false); // 월 편집 상태
    const [isEditingYear, setIsEditingYear] = useState(false); // 연도 편집 상태
    const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M')); // 월 입력 값
    const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy')); // 연도 입력 값
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림 상태
    const [isYearlyView, setIsYearlyView] = useState(false); // 연간 보기 상태
    const [currentYear, setCurrentYear] = useState(new Date()); // 현재 연도
    const [isEditingYearInYearlyView, setIsEditingYearInYearlyView] = useState(false); // 연간 보기에서 연도 편집 상태
    const [userStickers, setUserStickers] = useState([]); // 사용자 스티커

    // 컴포넌트 마운트 시 로컬 스토리지에서 스티커 로드
    useEffect(() => {
        const stickersFromLocalStorage = localStorage.getItem('userStickers');
        if (stickersFromLocalStorage) {
            setUserStickers(JSON.parse(stickersFromLocalStorage));
        }
    }, []);

    // 컴포넌트 마운트 시 기분 색상과 스티커 로드
    useEffect(() => {
        setToday(new Date());
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {};
        const storedMoodStickers = JSON.parse(localStorage.getItem('moodStickers')) || {};
        setMoodColors(storedMoodColors);
        setMoodStickers(storedMoodStickers);
    }, []);

    // 기분 색상 변경 시 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem('moodColors', JSON.stringify(moodColors));
    }, [moodColors]);

    // 기분 스티커 변경 시 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem('moodStickers', JSON.stringify(moodStickers));
    }, [moodStickers]);

    // 월 이동 함수
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    
    // 연도 이동 함수
    const prevYear = () => setCurrentYear(subYears(currentYear, 1));
    const nextYear = () => setCurrentYear(addYears(currentYear, 1));

    // 오늘 날짜로 이동 함수
    const goToToday = () => {
        setCurrentMonth(startOfMonth(today));
        setIsYearlyView(false);
    };

    // 날짜 클릭 핸들러
    const onDateClick = (day) => {
        if (!isAfter(day, today)) {
            setSelectedDate(day);
            setShowColorPicker(true);
            setShowStickerPicker(true);
        }
    };

    // 색상 클릭 핸들러
    const handleColorClick = (color) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            setMoodColors(prevColors => ({
                ...prevColors,
                [dateStr]: color,
            }));
        }
        setShowColorPicker(false);
    };

    // 스티커 클릭 핸들러
    const handleStickerClick = (sticker) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            setMoodStickers(prevStickers => ({
                ...prevStickers,
                [dateStr]: sticker,
            }));
        }
        setShowStickerPicker(false);
    };

    // 월 변경 핸들러
    const handleMonthChange = () => {
        const newMonth = parseInt(inputMonth, 10);
        if (newMonth >= 1 && newMonth <= 12) {
            setCurrentMonth(setMonth(currentMonth, newMonth - 1));
            setIsEditingMonth(false);
        }
    };

    // 연도 변경 핸들러
    const handleYearChange = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900) {
            setCurrentMonth(setYear(currentMonth, newYear));
            setIsEditingYear(false);
        }
    };

    // 연간 보기에서 연도 변경 핸들러
    const handleYearChangeInYearlyView = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900) {
            setCurrentYear(setYear(currentYear, newYear));
            setIsEditingYearInYearlyView(false);
        }
    };

    // 엔터 키 누를 때 콜백 실행
    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            callback();
        }
    };

    // 헤더 렌더링
    const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => (
        <div className="calendar-header">
            <button className="prev-button" onClick={prevMonth}>◀</button>
            <div className="month-year-container">
                {isEditingYear ? (
                    <input
                        type="number"
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                        onBlur={handleYearChange}
                        onKeyDown={(e) => handleKeyDown(e, handleYearChange)}
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
                        onKeyDown={(e) => handleKeyDown(e, handleMonthChange)}
                        autoFocus
                        className="month-year-input"
                    />
                ) : (
                    <span className="month-year" onClick={() => setIsEditingMonth(true)}>
                        {format(currentMonth, 'M월')}
                    </span>
                )}
            </div>
            <button className="next-button" onClick={nextMonth}>▶</button>
        </div>
    );

    // 요일 헤더 렌더링
    const RenderDays = () => {
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
    };

    // 날짜 셀 렌더링
    const RenderCells = ({ currentMonth, moodColors, moodStickers, onDateClick }) => {
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
                const daySticker = moodStickers[dayKey];

                days.push(
                    <div
                        className={`col cell ${
                            !isSameMonth(currentDay, startOfMonth(currentMonth))
                                ? 'disabled'
                                : isSameDay(currentDay, today)
                                ? 'today'
                                : isSameDay(currentDay, selectedDate)
                                ? 'selected'
                                : 'valid'
                        } ${isAfter(currentDay, today) ? 'disabled' : ''}`}
                        key={dayKey}
                        style={{ backgroundColor: dayColor }}
                        onClick={() => onDateClick(currentDay)}
                    >
                        <span className={
                            !isSameMonth(currentDay, startOfMonth(currentMonth))
                                ? 'text not-valid'
                                : ''
                        }>
                            {format(currentDay, 'd')}
                        </span>
                        {daySticker && (
                            <img
                                src={daySticker.image_url}
                                alt={daySticker.name}
                                className="sticker-icon"
                            />
                        )}
                    </div>
                );

                day = addDays(day, 1);
            }
            rows.push(
                <div className="row" key={format(day, 'yyyy-MM-dd')}>
                    {days}
                </div>
            );
        }
        return <div className="body">{rows}</div>;
    };

    // 작은 월 렌더링
    const RenderMiniMonth = ({ month, moodColors, moodStickers }) => {
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(startDate);
        const days = [];
        let day = startDate;

        while (day <= endDate) {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayColor = moodColors[dayKey] || 'transparent';
            const daySticker = moodStickers[dayKey];

            days.push(
                <div
                    key={dayKey}
                    className={`mini-cell ${isSameDay(day, today) ? 'today' : ''}`}
                    style={{ backgroundColor: dayColor }}
                >
                    {daySticker && (
                        <img
                            src={daySticker.image_url}
                            alt={daySticker.name}
                            className="sticker-icon-mini"
                        />
                    )}
                </div>
            );
            day = addDays(day, 1);
        }

        return (
            <div className="mini-month">
                <div className="mini-month-header">{format(month, 'MMM yyyy')}</div>
                <div className="mini-month-body">{days}</div>
            </div>
        );
    };

    // 연간 보기 렌더링
    const RenderYearView = ({ currentYear, moodColors, moodStickers }) => {
        const months = eachMonthOfInterval({
            start: startOfYear(currentYear),
            end: endOfYear(currentYear)
        });

        return (
            <div className="year-view">
    <button className="prev-year-button" onClick={prevYear}>◀</button>
    <div className="year-view-header">
        {isEditingYearInYearlyView ? (
            <input
                type="number"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
                onBlur={handleYearChangeInYearlyView}
                onKeyDown={(e) => handleKeyDown(e, handleYearChangeInYearlyView)}
                autoFocus
                className="year-input"
            />
        ) : (
            <span className="year-text" onClick={() => setIsEditingYearInYearlyView(true)}>
                {format(currentYear, 'yyyy')}
            </span>
        )}
    </div>
    <div className="year-months">
        {months.map((month, index) => (
            <RenderMiniMonth key={index} month={month} moodColors={moodColors} moodStickers={moodStickers} />
        ))}
    </div>
    <button className="next-year-button" onClick={nextYear}>▶</button>
</div>

        );
    };

    // 색상 및 스티커 선택기 렌더링
    const RenderColorAndStickerPicker = () => (
        <div className="color-sticker-picker">
            <div className={`color-picker ${showColorPicker ? 'visible' : ''}`}>
                {colors.map(color => (
                    <div
                        key={color}
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorClick(color)}
                    />
                ))}
            </div>
            <div className={`sticker-picker ${showStickerPicker ? 'visible' : ''}`}>
                {userStickers.map(sticker => (
                    <div
                        key={sticker.sticker_id}
                        className="sticker-option"
                        onClick={() => handleStickerClick(sticker)}
                    >
                        <img src={sticker.image_url} alt={sticker.name} className="sticker-image" />
                        <div className="sticker-info">
                            <span>{sticker.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 사이드바 열기/닫기 토글 함수
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // 현재 보기 및 연간 보기 클릭 핸들러
    const handleCurrentViewClick = () => setIsYearlyView(false);
    const handleYearlyViewClick = () => setIsYearlyView(true);

    return (
        <div className="calendar-container">
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                {!isSidebarOpen && (
                    <div className="sidebar-icon" onClick={toggleSidebar}>
                        <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                )}
                {isSidebarOpen && (
                    <div className="sidebar-content">
                        <button className="close-button" onClick={toggleSidebar}>◀</button>
                        <button className="sidebar-button" onClick={handleYearlyViewClick}>연간 달력 보기</button>
                        <button className="sidebar-button" onClick={handleCurrentViewClick}>월별 달력 보기</button>
                        <span className="material-symbols-outlined" onClick={goToToday}>refresh</span>
                    </div>
                )}
            </div>
            {!isYearlyView ? (
                <>
                    <RenderHeader
                        currentMonth={currentMonth}
                        prevMonth={prevMonth}
                        nextMonth={nextMonth}
                    />
                     <div className="calendar">
                        <RenderDays />
                        <RenderCells
                            currentMonth={currentMonth}
                            moodColors={moodColors}
                            moodStickers={moodStickers}
                            onDateClick={onDateClick}
                        />
                    </div>
                </>
            ) : (
                <RenderYearView currentYear={currentYear} moodColors={moodColors} moodStickers={moodStickers} />
            )}
            {(showColorPicker || showStickerPicker) && <RenderColorAndStickerPicker />}
        </div>
    );
}

export default Calendar;
