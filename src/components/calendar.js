import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, isSameMonth, isSameDay, startOfMonth,
    endOfMonth, startOfWeek, endOfWeek, addDays, isAfter, eachMonthOfInterval,
    startOfYear, endOfYear, addYears, subYears
} from 'date-fns';
import { fetchUserStickers, addToCalendar, setMoodColor } from './api/api';

function Calendar() {
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [moodColors, setMoodColors] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [today, setToday] = useState(new Date());
    const [isYearlyView, setIsYearlyView] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date());
    const [stickers, setStickers] = useState([]);
    const [showStickerPicker, setShowStickerPicker] = useState(false);

    // 환경변수로 토큰을 관리하거나, 로그인 상태에서 가져오는 것이 좋습니다.
    const token = process.env.REACT_APP_API_TOKEN; 

    useEffect(() => {
        setToday(new Date());
        fetchUserStickersData();
    }, []);

    const fetchUserStickersData = async () => {
        try {
            const data = await fetchUserStickers(token);
            console.log('Fetched stickers:', data.stickers); // 응답 확인
            setStickers(data.stickers);
        } catch (error) {
            console.error('Error fetching user stickers:', error.message);
        }
    };

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => {
        setCurrentMonth(startOfMonth(today));
        setIsYearlyView(false);
    };

    const onDateClick = (day) => {
        if (!isAfter(day, today)) {
            setSelectedDate(day);
            setShowColorPicker(true);
            setShowStickerPicker(true);
        }
    };

    const handleColorClick = async (color) => {
        if (selectedDate) {
            try {
                const dateFormatted = format(selectedDate, 'yyyy-MM-dd');
                setMoodColors(prevColors => ({
                    ...prevColors,
                    [dateFormatted]: color,
                }));
                await setMoodColor(dateFormatted, color, token);
            } catch (error) {
                console.error('Failed to set mood color:', error.message);
            }
        }
        setShowColorPicker(false);
    };

    const handleStickerClick = async (stickerId) => {
        if (selectedDate) {
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                await addToCalendar(formattedDate, moodColors[formattedDate] || colors[0], stickerId, token);
                setShowStickerPicker(false);
            } catch (error) {
                console.error('Failed to add sticker to calendar:', error.message);
            }
        }
    };

    const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => (
        <div className="calendar-header">
            <button className="prev-button" onClick={prevMonth}>◀</button>
            <span>{format(currentMonth, 'yyyy년 M월')}</span>
            <button className="next-button" onClick={nextMonth}>▶</button>
            <button className="yearly-view-button" onClick={() => setIsYearlyView(!isYearlyView)}>📅</button>
            <button className="today-button" onClick={goToToday}>Today</button>
        </div>
    );

    const RenderDays = () => (
        <div className="days">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="col">{day}</div>
            ))}
        </div>
    );

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
                const isToday = isSameDay(currentDay, today);
                const isSelected = isSameDay(currentDay, selectedDate);
                const isInCurrentMonth = isSameMonth(currentDay, currentMonth);
                const formattedDate = format(currentDay, 'yyyy-MM-dd');
                const backgroundColor = moodColors[formattedDate] || 'transparent';

                days.push(
                    <div
                        key={currentDay}
                        className={`cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isInCurrentMonth ? 'valid' : 'disabled'}`}
                        style={{ backgroundColor }}
                        onClick={() => onDateClick(currentDay)}
                    >
                        {format(currentDay, 'd')}
                        {moodColors[formattedDate] && <div className="sticker" />}
                    </div>
                );

                day = addDays(day, 1);
            }

            rows.push(<div key={day} className="row">{days}</div>);
        }

        return <div className="body">{rows}</div>;
    };

    const RenderMiniMonth = () => {
        const months = eachMonthOfInterval({
            start: startOfYear(currentYear),
            end: endOfYear(currentYear)
        });

        return (
            <div className="year-view">
                <div className="year-header">
                    <button className="prev-button" onClick={() => setCurrentYear(subYears(currentYear, 1))}>◀</button>
                    <span>{format(currentYear, 'yyyy년')}</span>
                    <button className="next-button" onClick={() => setCurrentYear(addYears(currentYear, 1))}>▶</button>
                </div>
                <div className="months-container">
                    {months.map(month => (
                        <div 
                            key={month} 
                            className="monthly-calendar"
                            onClick={() => {
                                setCurrentMonth(startOfMonth(month));
                                setIsYearlyView(false);
                            }}
                        >
                            <span>{format(month, 'M월')}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <RenderHeader
                currentMonth={currentMonth}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
            />
            <RenderDays />
            {isYearlyView ? <RenderMiniMonth /> : <RenderCells currentMonth={currentMonth} moodColors={moodColors} onDateClick={onDateClick} />}
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
            {showStickerPicker && (
                <div className="sticker-picker">
                    {stickers.map(sticker => (
                        <div
                            key={sticker.sticker_id}
                            className="sticker-option"
                            onClick={() => handleStickerClick(sticker.sticker_id)}
                        >
                            <img
                                src={sticker.image_url}
                                alt={sticker.name}
                                style={{ width: '30px', height: '30px' }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Calendar;
