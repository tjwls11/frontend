import React, { useState, useEffect } from 'react';
import MoodChart from '../components/MoodChart';
import { fetchUserCalendar } from './api/api';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

const MoodPage = () => {
    const [moodColors, setMoodColors] = useState({});
    const [moodTags, setMoodTags] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [filteredMoodColors, setFilteredMoodColors] = useState({});
    const [filteredMoodTags, setFilteredMoodTags] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const initializeMoodData = async () => {
            try {
                const calendarData = await fetchUserCalendar(token);
                if (calendarData && calendarData.isSuccess) {
                    const colorsData = {};
                    const tagsData = [];
                    calendarData.data.forEach(entry => {
                        const date = format(new Date(entry.date), 'yyyy-MM-dd');
                        colorsData[date] = entry.color;
                        tagsData.push({ date: entry.date, tag: entry.tag, color: entry.color });
                    });
                    setMoodColors(colorsData);
                    setMoodTags(tagsData);
                } else {
                    console.error('캘린더 데이터 조회 실패:', calendarData ? calendarData.message : '응답 데이터 없음');
                }
            } catch (error) {
                console.error('Error initializing mood data:', error.message || error);
            }
        };

        if (token) {
            initializeMoodData();
        }
    }, [token]);

    useEffect(() => {
        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(start);
        const filteredColors = Object.keys(moodColors).reduce((acc, date) => {
            const currentDate = new Date(date);
            if (currentDate >= start && currentDate <= end) {
                acc[date] = moodColors[date];
            }
            return acc;
        }, {});
        const filteredTags = moodTags.filter(({ date }) => {
            const currentDate = new Date(date);
            return currentDate >= start && currentDate <= end;
        });
        setFilteredMoodColors(filteredColors);
        setFilteredMoodTags(filteredTags);
    }, [selectedMonth, moodColors, moodTags]);

    const handleMonthChange = (direction) => {
        setSelectedMonth(prev => {
            const newDate = direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
            return new Date(newDate);
        });
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-outline-primary" onClick={() => handleMonthChange('prev')}>◀</button>
                <div className="text-center">
                    {`${format(selectedMonth, 'MMMM yyyy')}의 감정 상태`}
                </div>
                <button className="btn btn-outline-primary" onClick={() => handleMonthChange('next')}>▶</button>
            </div>
            <MoodChart moodColors={filteredMoodColors} moodTags={filteredMoodTags} />
        </div>
    );
};

export default MoodPage;
