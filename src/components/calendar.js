import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, isSameMonth, isSameDay, startOfMonth,
    endOfMonth, startOfWeek, endOfWeek, addDays, isAfter, setMonth,
    setYear, startOfYear, endOfYear, eachMonthOfInterval, addYears, subYears
} from 'date-fns';

function Calendar() {
    const colors = ['','#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5','#ACD1EA','#9FB1D9','#C8BFE7'];
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [moodColors, setMoodColors] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [today, setToday] = useState(new Date());
    const [isEditingMonth, setIsEditingMonth] = useState(false);
    const [isEditingYear, setIsEditingYear] = useState(false);
    const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M'));
    const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isYearlyView, setIsYearlyView] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date());
    const [isEditingYearInYearlyView, setIsEditingYearInYearlyView] = useState(false);

    useEffect(() => {
        setToday(new Date());
        // 페이지 로드 시 로컬 스토리지에서 색상 정보를 가져옴
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {};
        setMoodColors(storedMoodColors);
    }, []);

    useEffect(() => {
        // 색상 정보가 변경될 때마다 로컬 스토리지에 저장
        localStorage.setItem('moodColors', JSON.stringify(moodColors));
    }, [moodColors]);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevYear = () => setCurrentYear(subYears(currentYear, 1));
    const nextYear = () => setCurrentYear(addYears(currentYear, 1));
    const goToToday = () => {
        setCurrentMonth(startOfMonth(today));
        setIsYearlyView(false);
    };

    const onDateClick = (day) => {
        if (!isAfter(day, today)) {
            setSelectedDate(day);
            setShowColorPicker(true);
        }
    };

    const handleColorClick = (color) => {
        if (selectedDate) {
            setMoodColors(prevColors => ({
                ...prevColors,
                [format(selectedDate, 'yyyy-MM-dd')]: color,
            }));
        }
        setShowColorPicker(false);
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

    const handleYearChangeInYearlyView = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900) {
            setCurrentYear(setYear(currentYear, newYear));
            setIsEditingYearInYearlyView(false);
        }
    };

    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            callback();
        }
    };

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

    const RenderDays = () => {
        const days = [];
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="col" key={i}>
                    {dayLabels[i]}
                </div>
            );
        }

        return <div className="days row">{days}</div>;
    };

    const RenderCells = ({ currentMonth, moodColors, onDateClick }) => {
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
    
    const RenderMiniMonth = ({ month, moodColors, onMonthClick }) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
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
                        className={`monthly-calendar-cell ${
                            !isSameMonth(currentDay, monthStart) ? 'disabled' : ''
                        } ${
                            isSameDay(currentDay, today) ? 'today' : ''
                        }`}
                        key={dayKey}
                        onClick={() => onMonthClick(month)}
                    >
                        <div className="day-circle" style={{ backgroundColor: dayColor }}>
                            {format(currentDay, 'd')}
                        </div>
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

        return (
            <div className="monthly-calendar" onClick={() => onMonthClick(month)}>
                <div className="month-box">
                    <div className="month-title">{format(month, 'M월')}</div>
                    {rows}
                </div>
            </div>
        );
    };

    const RenderYearView = ({ currentYear, moodColors }) => {
        const yearStart = startOfYear(currentYear);
        const yearEnd = endOfYear(currentYear);
        const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

        const handleMonthClick = (month) => {
            setCurrentMonth(month);
            setIsYearlyView(false);
        };

        return (
            <div className="year-view">
                <div className="year-header">
                    <button onClick={prevYear} className="prev-button">◀</button>
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
                        <span className="year-display" onClick={() => setIsEditingYearInYearlyView(true)}>
                            {format(currentYear, 'yyyy년')}
                        </span>
                    )}
                    <button onClick={nextYear} className="next-button">▶</button>
                </div>
                <div className="months-container">
                    {months.map((month, index) => (
                        <RenderMiniMonth
                            key={index}
                            month={month}
                            moodColors={moodColors}
                            onMonthClick={handleMonthClick}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleYearlyViewClick = () => setIsYearlyView(true);
    const handleCurrentViewClick = () => setIsYearlyView(false);

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
                            onDateClick={onDateClick}
                        />
                    </div>
                </>
            ) : (
                <RenderYearView currentYear={currentYear} moodColors={moodColors} />
            )}
            {showColorPicker && (
                <div className="color-picker">
                    {colors.map(color => (
                        <div
                            key={color}
                            className="color-option"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorClick(color)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Calendar;
