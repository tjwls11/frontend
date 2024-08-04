import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
    isSameMonth, eachMonthOfInterval, startOfYear, endOfYear, addYears, subYears, setMonth, setYear,
    isSameDay, isAfter } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import { setMoodColor, fetchUserCalendar, saveMoodTag } from './api/api';

const RenderSidebar = ({ isOpen, selectedDate, colors, handleMoodChange, closeSidebar }) => {
    const [moodTag, setMoodTag] = useState('');

    if (!isOpen || !selectedDate) return null;

    const handleSaveMoodTag = () => {
        handleMoodChange(null, moodTag);
        setMoodTag('');
    };

    return (
        <div className="sidebar">
            <h2>{format(selectedDate, 'yyyy-MM-dd')}</h2>
            <div className="d-flex flex-wrap mb-3">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        className="btn m-1"
                        onClick={() => handleMoodChange(color)}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value)}
                    placeholder="Enter mood tag..."
                    className="form-control"
                />
                <button
                    className="btn btn-primary mt-2"
                    onClick={handleSaveMoodTag}
                >
                    Save Mood Tag
                </button>
            </div>
            <button className="btn btn-outline-secondary mt-3" onClick={closeSidebar}>
                Close
            </button>
        </div>
    );
};

function Calendar() {
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [moodColors, setMoodColors] = useState({});
    const [moodTags, setMoodTags] = useState({});
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
            if (!token) return;
            try {
                const calendarData = await fetchUserCalendar(token);
                if (calendarData?.isSuccess) {
                    const colorsData = {};
                    const tagsData = {};
                    calendarData.data.forEach(entry => {
                        const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
                        colorsData[dateStr] = entry.color;
                        tagsData[dateStr] = entry.tag;
                    });
                    setMoodColors(colorsData);
                    setMoodTags(tagsData);
                } else {
                    console.error('캘린더 데이터 조회 실패:', calendarData?.message || '응답 데이터 없음');
                }
            } catch (error) {
                console.error('Error initializing calendar data:', error.message || error);
            }
        };

        initializeCalendar();
    }, [token]);

    useEffect(() => {
        setToday(new Date());
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {};
        const storedMoodTags = JSON.parse(localStorage.getItem('moodTags')) || {};
        setMoodColors(storedMoodColors);
        setMoodTags(storedMoodTags);
    }, []);

    useEffect(() => {
        localStorage.setItem('moodColors', JSON.stringify(moodColors));
    }, [moodColors]);

    useEffect(() => {
        localStorage.setItem('moodTags', JSON.stringify(moodTags));
    }, [moodTags]);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevYear = () => setCurrentYear(subYears(currentYear, 1));
    const nextYear = () => setCurrentYear(addYears(currentYear, 1));

    const onDateClick = (day) => {
        if (isAfter(day, today)) return;
        setSelectedDate(day);
        setIsSidebarOpen(true);
    };

    const handleMoodChange = async (color, tag) => {
        if (!selectedDate) return;

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const updateMoodColor = async () => {
            if (color) {
                setMoodColors(prevColors => ({
                    ...prevColors,
                    [dateStr]: color,
                }));
                try {
                    if (!token) throw new Error('Token not provided.');
                    await setMoodColor(dateStr, color, token);
                    console.log('Mood color saved to server');
                } catch (error) {
                    console.error('Error saving mood color:', error);
                }
            }
        };

        const updateMoodTag = async () => {
            if (tag) {
                setMoodTags(prevTags => ({
                    ...prevTags,
                    [dateStr]: tag,
                }));
                try {
                    if (!token) throw new Error('Token not provided.');
                    await saveMoodTag(dateStr, tag, token);
                    console.log('Mood tag saved to server');
                } catch (error) {
                    console.error('Error saving mood tag:', error);
                }
            }
        };

        await Promise.all([updateMoodColor(), updateMoodTag()]);
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

    const RenderCells = ({ currentMonth, moodColors, onDateClick, selectedDate }) => {
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

                days.push(
                    <div
                        className={`col text-center p-2 calendar-cell ${isSameMonth(currentDay, monthStart) ? '' : 'text-muted'} ${isSameDay(currentDay, selectedDate) ? 'selected' : ''}`}
                        key={currentDay}
                        onClick={() => onDateClick(currentDay)}
                        style={{ backgroundColor: color }}
                    >
                        <span>{format(currentDay, 'd')}</span>
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
                            onDateClick={onDateClick}
                            selectedDate={selectedDate} // 전달된 selectedDate로 수정
                        />
                    </div>
                ))}
            </div>
        );
    };

    const handleYearlyViewToggle = () => setIsYearlyView(prev => !prev);

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
                        onDateClick={onDateClick}
                        selectedDate={selectedDate}
                    />
                </>
            )}
            <RenderSidebar
                isOpen={isSidebarOpen}
                selectedDate={selectedDate}
                colors={colors}
                handleMoodChange={handleMoodChange}
                closeSidebar={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}

export default Calendar;
