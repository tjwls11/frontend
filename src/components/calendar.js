import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
    isSameMonth, eachMonthOfInterval, startOfYear, endOfYear, addYears, subYears, setMonth, setYear,
    isAfter
} from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import { setMoodColor, fetchUserCalendar } from './api/api';

const RenderSidebar = ({ isOpen, selectedDate, colors, stickers, handleMoodChange, closeSidebar }) => {
    if (!isOpen || !selectedDate) return null;

    return (
        <div className="sidebar">
            <h2>{format(selectedDate, 'yyyy-MM-dd')}</h2>
            <div className="d-flex flex-wrap">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        className="btn m-1"
                        onClick={() => handleMoodChange(color, null)}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            <div className="d-flex flex-wrap mt-3">
                {stickers.map((sticker, index) => (
                    <button
                        key={index}
                        className="btn m-1"
                        onClick={() => handleMoodChange(null, sticker)}
                    >
                        <img src={sticker} alt="sticker" style={{ width: '20px', height: '20px' }} />
                    </button>
                ))}
            </div>
            <button className="btn btn-outline-secondary mt-3" onClick={closeSidebar}>
                Close
            </button>
        </div>
    );
};

function Calendar() {
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];
    const stickers = [
        'https://i.ibb.co/swgdV4Z/free-icon-emoji-6723246.png',
        'https://i.ibb.co/Ss48HGm/free-icon-sad-3129281.png',
    ];

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [moodColors, setMoodColors] = useState({});
    const [moodStickers, setMoodStickers] = useState({});
    const [today, setToday] = useState(new Date());
    const [isEditingMonth, setIsEditingMonth] = useState(false);
    const [inputMonth, setInputMonth] = useState(format(new Date(), 'M'));
    const [inputYear, setInputYear] = useState(format(new Date(), 'yyyy'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isYearlyView, setIsYearlyView] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date());
    const [isEditingYearInYearlyView, setIsEditingYearInYearlyView] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const initializeCalendar = async () => {
            try {
                const calendarData = await fetchUserCalendar(token);
                console.log('Received calendar data:', calendarData);

                if (calendarData && calendarData.isSuccess) {
                    // 데이터 로드 성공
                    const colorsData = {};
                    calendarData.data.forEach(entry => {
                        colorsData[format(new Date(entry.date), 'yyyy-MM-dd')] = entry.color;
                    });
                    setMoodColors(colorsData);
                } else {
                    console.error('캘린더 데이터 조회 실패:', calendarData ? calendarData.message : '응답 데이터 없음');
                }
            } catch (error) {
                console.error('Error initializing calendar data:', error.message || error);
            }
        };

        // 토큰이 있는 경우에만 API 호출
        if (token) {
            initializeCalendar();
        }
    }, [token]);

    useEffect(() => {
        setToday(new Date());
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {};
        const storedMoodStickers = JSON.parse(localStorage.getItem('moodStickers')) || {};
        setMoodColors(storedMoodColors);
        setMoodStickers(storedMoodStickers);
    }, []);

    useEffect(() => {
        localStorage.setItem('moodColors', JSON.stringify(moodColors));
    }, [moodColors]);

    useEffect(() => {
        localStorage.setItem('moodStickers', JSON.stringify(moodStickers));
    }, [moodStickers]);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevYear = () => setCurrentYear(subYears(currentYear, 1));
    const nextYear = () => setCurrentYear(addYears(currentYear, 1));

    const onDateClick = (day) => {
        if (!isAfter(day, today)) {
            setSelectedDate(day);
            setIsSidebarOpen(true);
        }
    };

    const handleMoodChange = async (color, sticker) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            setMoodColors(prevColors => ({
                ...prevColors,
                [dateStr]: color || prevColors[dateStr],
            }));
            setMoodStickers(prevStickers => ({
                ...prevStickers,
                [dateStr]: sticker || prevStickers[dateStr],
            }));
            try {
                if (!token) throw new Error('Token not provided.');
                await setMoodColor(dateStr, color, token);
                // 스티커는 서버에 저장하지 않음
                console.log('Mood saved to server');
            } catch (error) {
                console.error('Error saving mood:', error);
            }
        }
    };

    const handleMonthChange = () => {
        const newMonth = parseInt(inputMonth, 10);
        if (newMonth >= 1 && newMonth <= 12) {
            setCurrentMonth(setMonth(currentMonth, newMonth - 1));
            setIsEditingMonth(false);
        }
    };

    const handleYearChangeInYearlyView = () => {
        const newYear = parseInt(inputYear, 10);
        if (newYear >= 1900 && newYear <= today.getFullYear()) {
            setCurrentYear(setYear(currentYear, newYear));
            setIsEditingYearInYearlyView(false);
        } else {
            alert("Please enter a valid year.");
        }
    };

    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            callback();
        }
    };

    const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-primary" onClick={prevMonth}>◀</button>
            <div className="text-center">
                {isEditingMonth ? (
                    <input
                        type="number"
                        value={inputMonth}
                        onChange={(e) => setInputMonth(e.target.value)}
                        onBlur={handleMonthChange}
                        onKeyDown={(e) => handleKeyDown(e, handleMonthChange)}
                        autoFocus
                        className="form-control"
                    />
                ) : (
                    <span onClick={() => setIsEditingMonth(true)}>{format(currentMonth, 'MMMM yyyy')}</span>
                )}
            </div>
            <button className="btn btn-outline-primary" onClick={nextMonth}>▶</button>
        </div>
    );

    const RenderDays = () => {
        const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        return (
            <div className="row">
                {dayLabels.map((label, i) => (
                    <div className="col text-center p-2" key={i}>
                        {label}
                    </div>
                ))}
            </div>
        );
    };

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
                const color = moodColors[dayKey];
                const sticker = moodStickers[dayKey];

                days.push(
                    <div
                        className={`col text-center p-2 ${isSameMonth(currentDay, monthStart) ? '' : 'text-muted'}`}
                        key={currentDay}
                        onClick={() => onDateClick(currentDay)}
                        style={{ backgroundColor: color }}
                    >
                        <span>{format(currentDay, 'd')}</span>
                        {sticker && <img src={sticker} alt="sticker" className="sticker" />}
                    </div>
                );

                day = addDays(day, 1);
            }

            rows.push(
                <div className="row" key={day}>
                    {days}
                </div>
            );
        }

        return <div>{rows}</div>;
    };

    const RenderYearlyView = ({ currentYear, moodColors, onDateClick }) => {
        const months = eachMonthOfInterval({
            start: startOfYear(currentYear),
            end: endOfYear(currentYear),
        });

        return (
            <div className="yearly-view">
                {months.map((month, index) => (
                    <div key={index} className="monthly-view">
                        <div className="text-center">
                            {format(month, 'MMM')}
                        </div>
                        <RenderCells
                            currentMonth={month}
                            moodColors={moodColors}
                            moodStickers={moodStickers}
                            onDateClick={onDateClick}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const handleYearlyViewToggle = () => setIsYearlyView(!isYearlyView);

    const RenderYearlyViewHeader = ({ currentYear, prevYear, nextYear }) => (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-primary" onClick={prevYear}>◀</button>
            <div className="text-center">
                {isEditingYearInYearlyView ? (
                    <input
                        type="number"
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                        onBlur={handleYearChangeInYearlyView}
                        onKeyDown={(e) => handleKeyDown(e, handleYearChangeInYearlyView)}
                        autoFocus
                        className="form-control"
                    />
                ) : (
                    <span onClick={() => setIsEditingYearInYearlyView(true)}>{format(currentYear, 'yyyy년')}</span>
                )}
            </div>
            <button className="btn btn-outline-primary" onClick={nextYear}>▶</button>
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-outline-primary" onClick={handleYearlyViewToggle}>
                    {isYearlyView ? 'Monthly View' : 'Yearly View'}
                </button>
            </div>
            {isYearlyView ? (
                <>
                    <RenderYearlyViewHeader
                        currentYear={currentYear}
                        prevYear={prevYear}
                        nextYear={nextYear}
                    />
                    <RenderYearlyView
                        currentYear={currentYear}
                        moodColors={moodColors}
                        moodStickers={moodStickers}
                        onDateClick={onDateClick}
                    />
                </>
            ) : (
                <>
                    <RenderHeader
                        currentMonth={currentMonth}
                        prevMonth={prevMonth}
                        nextMonth={nextMonth}
                    />
                    <RenderDays />
                    <RenderCells
                        currentMonth={currentMonth}
                        moodColors={moodColors}
                        moodStickers={moodStickers}
                        onDateClick={onDateClick}
                    />
                </>
            )}
            <RenderSidebar
                isOpen={isSidebarOpen}
                selectedDate={selectedDate}
                colors={colors}
                stickers={stickers}
                handleMoodChange={handleMoodChange}
                closeSidebar={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}

export default Calendar;
