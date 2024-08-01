import React, { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
    isSameMonth, eachMonthOfInterval, startOfYear, endOfYear, addYears, subYears, setMonth, setYear,
    isAfter
} from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS를 임포트하여 기본 스타일을 적용
import { setMoodColor, fetchUserStickers} from './api/api'; // API 호출 함수 임포트

function Calendar() {
    // Mood colors used to color-code dates
    const colors = ['#FFABAB', '#FFC3A0', '#FFF58E', '#CDE6A5', '#ACD1EA', '#9FB1D9', '#C8BFE7'];

    // State hooks for managing calendar data and UI state
    const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 달을 나타내는 상태
    const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜를 나타내는 상태
    const [moodColors, setMoodColors] = useState({}); // 날짜에 대한 감정 색상을 저장하는 상태
    const [stickers, setStickers] = useState({}); // 날짜에 대한 스티커를 저장하는 상태
    const [today, setToday] = useState(new Date()); // 오늘 날짜를 나타내는 상태
    const [isEditingMonth, setIsEditingMonth] = useState(false); // 월 편집 모드 여부를 나타내는 상태
    const [isEditingYear, setIsEditingYear] = useState(false); // 연도 편집 모드 여부를 나타내는 상태
    const [inputMonth, setInputMonth] = useState(format(currentMonth, 'M')); // 월 입력 상태
    const [inputYear, setInputYear] = useState(format(currentMonth, 'yyyy')); // 연도 입력 상태
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림 상태
    const [isYearlyView, setIsYearlyView] = useState(false); // 연간 보기 모드 여부
    const [currentYear, setCurrentYear] = useState(new Date()); // 현재 연도를 나타내는 상태
    const [isEditingYearInYearlyView, setIsEditingYearInYearlyView] = useState(false); // 연간 보기에서 연도 편집 모드 여부
    const [userStickers, setUserStickers] = useState([]); // 사용자의 스티커를 저장하는 상태

    const token = localStorage.getItem('token'); // 로컬 스토리지에서 인증 토큰을 가져옴

    // Load mood colors and stickers from local storage and fetch user stickers on component mount
    useEffect(() => {
        setToday(new Date()); // 컴포넌트가 마운트될 때 오늘 날짜 설정
        const storedMoodColors = JSON.parse(localStorage.getItem('moodColors')) || {}; // 로컬 스토리지에서 감정 색상 로드
        const storedStickers = JSON.parse(localStorage.getItem('stickers')) || {}; // 로컬 스토리지에서 스티커 로드
        setMoodColors(storedMoodColors); // 감정 색상 상태 업데이트
        setStickers(storedStickers); // 스티커 상태 업데이트

        const loadUserStickers = async () => {
            try {
                if (!token) throw new Error('Token not provided.'); // 토큰이 없으면 에러 발생
                const ownedStickers = await fetchUserStickers(token); // API에서 사용자 스티커를 가져옴
                setUserStickers(ownedStickers || []); // 스티커 상태 업데이트
            } catch (error) {
                console.error('Error fetching user stickers:', error); // 스티커 로드 오류 로그
            }
        };
        loadUserStickers(); // 스티커 로드 함수 호출
    }, [token]); // token이 변경될 때마다 실행

    // Save mood colors and stickers to local storage when they change
    useEffect(() => {
        localStorage.setItem('moodColors', JSON.stringify(moodColors)); // 감정 색상을 로컬 스토리지에 저장
        localStorage.setItem('stickers', JSON.stringify(stickers)); // 스티커를 로컬 스토리지에 저장
    }, [moodColors, stickers]); // moodColors와 stickers가 변경될 때마다 실행

    // Navigate to previous month
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1)); // 현재 월에서 1개월 전으로 이동
    // Navigate to next month
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1)); // 현재 월에서 1개월 후로 이동
    // Navigate to previous year
    const prevYear = () => setCurrentYear(subYears(currentYear, 1)); // 현재 연도에서 1년 전으로 이동
    // Navigate to next year
    const nextYear = () => setCurrentYear(addYears(currentYear, 1)); // 현재 연도에서 1년 후로 이동

    // Handle date click to select a date and open sidebar
    const onDateClick = (day) => {
        if (!isAfter(day, today)) { // 미래 날짜가 아닌 경우에만 처리
            setSelectedDate(day); // 선택된 날짜 설정
            setIsSidebarOpen(true); // 사이드바 열기
        }
    };

    // Handle mood color selection and save to server
    const handleColorClick = async (color) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // 날짜를 'yyyy-MM-dd' 형식으로 포맷
            setMoodColors(prevColors => ({
                ...prevColors,
                [dateStr]: color, // 선택된 날짜의 감정 색상 업데이트
            }));
            try {
                if (!token) throw new Error('Token not provided.'); // 토큰이 없으면 에러 발생
                await setMoodColor(dateStr, color, token); // API에 감정 색상 저장 요청
                console.log('Color saved to server'); // 서버에 저장 성공 로그
            } catch (error) {
                console.error('Error saving color:', error); // 감정 색상 저장 오류 로그
            }
        }
    };

    // Handle adding a sticker to the selected date
    const handleStickerAdd = async (stickerId) => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // 날짜를 'yyyy-MM-dd' 형식으로 포맷
            setStickers(prevStickers => ({
                ...prevStickers,
                [dateStr]: stickerId, // 선택된 날짜에 스티커 추가
            }));
            try {
                console.log('Sticker added to server'); // 서버에 스티커 추가 성공 로그
            } catch (error) {
                console.error('Error adding sticker:', error); // 스티커 추가 오류 로그
            }
        }
    };

    // Handle removing a sticker from the selected date
    const handleStickerRemove = async () => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd'); // 날짜를 'yyyy-MM-dd' 형식으로 포맷
            setStickers(prevStickers => {
                const updatedStickers = { ...prevStickers };
                delete updatedStickers[dateStr]; // 선택된 날짜의 스티커 제거
                return updatedStickers;
            });
            try {
                console.log('Sticker removed from server'); // 서버에서 스티커 제거 성공 로그
            } catch (error) {
                console.error('Error removing sticker:', error); // 스티커 제거 오류 로그
            }
        }
    };

    // Handle month input change and update current month
    const handleMonthChange = () => {
        const newMonth = parseInt(inputMonth, 10); // 입력된 월을 정수로 변환
        if (newMonth >= 1 && newMonth <= 12) { // 유효한 월인지 확인
            setCurrentMonth(setMonth(currentMonth, newMonth - 1)); // 현재 월을 업데이트
            setIsEditingMonth(false); // 월 편집 모드 종료
        }
    };

    // Handle year input change and update current month
    const handleYearChange = () => {
        const newYear = parseInt(inputYear, 10); // 입력된 연도를 정수로 변환
        if (newYear >= 1900 && newYear <= today.getFullYear()) { // 유효한 연도인지 확인
            setCurrentMonth(setYear(currentMonth, newYear)); // 현재 월의 연도를 업데이트
            setIsEditingYear(false); // 연도 편집 모드 종료
        } else {
            alert("Please enter a valid year."); // 유효하지 않은 연도일 때 경고
        }
    };

    // Handle year input change in yearly view and update current year
    const handleYearChangeInYearlyView = () => {
        const newYear = parseInt(inputYear, 10); // 입력된 연도를 정수로 변환
        if (newYear >= 1900 && newYear <= today.getFullYear()) { // 유효한 연도인지 확인
            setCurrentYear(setYear(currentYear, newYear)); // 현재 연도를 업데이트
            setIsEditingYearInYearlyView(false); // 연도 편집 모드 종료
        } else {
            alert("Please enter a valid year."); // 유효하지 않은 연도일 때 경고
        }
    };

    // Handle Enter key press in input fields
    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter') { // Enter 키가 눌렸는지 확인
            e.preventDefault(); // 기본 동작 방지
            callback(); // 콜백 함수 호출
        }
    };

    // Render header with month/year navigation
    const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-primary" onClick={prevMonth}>◀</button> {/* 이전 월 버튼 */}
            <div className="text-center">
                {isEditingYear ? (
                    <input
                        type="number"
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                        onBlur={handleYearChange}
                        onKeyDown={(e) => handleKeyDown(e, handleYearChange)}
                        autoFocus
                        className="form-control"
                    />
                ) : (
                    <span onClick={() => setIsEditingYear(true)}>{format(currentMonth, 'yyyy년')}</span> )/* 연도 표시 및 클릭 시 편집 모드 */}
                )
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
                    <span onClick={() => setIsEditingMonth(true)}>{format(currentMonth, 'M월')}</span> )/* 월 표시 및 클릭 시 편집 모드 */}
                )
            </div>
            <button className="btn btn-outline-primary" onClick={nextMonth}>▶</button> {/* 다음 월 버튼 */}
        </div>
    );

    // Render day labels (SUN, MON, TUE, etc.)
    const RenderDays = () => {
        const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; // 요일 라벨

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

    // Render calendar cells for the current month
    const RenderCells = ({ currentMonth, moodColors, stickers, onDateClick }) => {
        const monthStart = startOfMonth(currentMonth); // 현재 월의 시작 날짜
        const monthEnd = endOfMonth(monthStart); // 현재 월의 종료 날짜
        const startDate = startOfWeek(monthStart); // 월의 첫날이 포함된 주의 시작 날짜
        const endDate = endOfWeek(monthEnd); // 월의 마지막 날이 포함된 주의 종료 날짜
    
        const rows = [];
        let day = startDate;
    
        // Generate rows for each week
        while (day <= endDate) {
            const days = [];
    
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayKey = format(currentDay, 'yyyy-MM-dd'); // 날짜를 'yyyy-MM-dd' 형식으로 포맷
                const dayColor = moodColors[dayKey] || 'transparent'; // 날짜의 감정 색상 또는 투명색
                const stickerId = stickers[dayKey]; // 날짜의 스티커 ID
                const sticker = userStickers.find(s => s.sticker_id === stickerId); // 스티커 정보 찾기
    
                days.push(
                    <div
                        className={`col text-center p-2 border ${
                            !isSameMonth(currentDay, currentMonth) ? 'text-muted' : ''
                        }`}
                        key={dayKey}
                        onClick={() => onDateClick(currentDay)} // 날짜 클릭 시 핸들러 호출
                        style={{
                            cursor: 'pointer',
                            backgroundColor: dayColor,
                            position: 'relative',
                            paddingBottom: '40px',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="position-relative">
                            {format(currentDay, 'd')} {/* 날짜 숫자 */}
                            {sticker && (
                                <img
                                    src={sticker.image_url} // 스티커 이미지 URL
                                    alt={sticker.name}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        position: 'absolute',
                                        bottom: '5px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        objectFit: 'contain',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1); // 다음 날로 이동
            }
            rows.push(<div className="row" key={format(day, 'yyyy-MM-dd')}>{days}</div>); // 주 단위로 행 추가
        }
    
        return <div>{rows}</div>; // 모든 주를 포함한 행 반환
    };
    

    // Render mini month view for yearly view
    const RenderMiniMonth = ({ month, moodColors }) => {
        const monthStart = startOfMonth(month); // 현재 월의 시작 날짜
        const monthEnd = endOfMonth(month); // 현재 월의 종료 날짜
        const startDate = startOfWeek(monthStart); // 월의 첫날이 포함된 주의 시작 날짜
        const endDate = endOfWeek(monthEnd); // 월의 마지막 날이 포함된 주의 종료 날짜

        const rows = [];
        let day = startDate;

        // Generate rows for each week
        while (day <= endDate) {
            const days = [];

            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayKey = format(currentDay, 'yyyy-MM-dd'); // 날짜를 'yyyy-MM-dd' 형식으로 포맷
                const dayColor = moodColors[dayKey] || 'transparent'; // 날짜의 감정 색상 또는 투명색

                days.push(
                    <div
                        className={`col text-center p-2 border ${
                            !isSameMonth(currentDay, month) ? 'text-muted' : ''
                        }`}
                        key={dayKey}
                    >
                        <div
                            className="rounded-circle"
                            style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: dayColor,
                            }}
                        ></div>
                        <div>{format(currentDay, 'd')}</div> {/* 날짜 숫자 */}
                    </div>
                );
                day = addDays(day, 1); // 다음 날로 이동
            }
            rows.push(<div className="row" key={format(day, 'yyyy-MM-dd')}>{days}</div>); // 주 단위로 행 추가
        }

        return <div>{rows}</div>; // 모든 주를 포함한 행 반환
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-4">
                <button className="btn btn-outline-primary" onClick={() => setIsYearlyView(!isYearlyView)}>
                    {isYearlyView ? '월별 보기' : '연간 보기'}
                </button>
            </div>

            {isSidebarOpen && (
                <div className="sidebar bg-light p-3" style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', borderTop: '1px solid #ddd' }}>
                    {selectedDate && (
                        <div className="mb-3">
                            <h5>색상 선택</h5>
                            {colors.map(color => (
                                <button
                                    key={color}
                                    className="btn"
                                    style={{ backgroundColor: color, width: '30px', height: '30px', border: 'none', margin: '2px' }}
                                    onClick={() => handleColorClick(color)}
                                ></button>
                            ))}
                        </div>
                    )}

                    {selectedDate && (
                        <div>
                            <h5>스티커</h5>
                            <div className="sticker-list">
                                {userStickers.map(sticker => (
                                    <div key={sticker.sticker_id} className="sticker-item">
                                        <img src={sticker.image_url} alt={sticker.name} className="sticker-image"
                                        onClick={() => handleStickerAdd(sticker.sticker_id)} />
                                        <div className="sticker-info">
                                            <h2>{sticker.name}</h2>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="btn btn-danger"
                                    onClick={handleStickerRemove}
                                    disabled={!stickers[format(selectedDate, 'yyyy-MM-dd')]}
                                >
                                    스티커 제거
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="btn btn-secondary mt-3" onClick={() => setIsSidebarOpen(false)}>닫기</button>
                </div>
            )}

            {isYearlyView ? (
                <div>
                    <RenderHeader currentMonth={currentYear} prevMonth={prevYear} nextMonth={nextYear} />
                    {eachMonthOfInterval({ start: startOfYear(currentYear), end: endOfYear(currentYear) }).map(month => (
                        <div key={month} className="mb-4">
                            <h5>{format(month, 'MMM yyyy')}</h5>
                            <RenderMiniMonth month={month} moodColors={moodColors} />
                        </div>
                    ))}
                    {isEditingYearInYearlyView && (
                        <input
                            type="number"
                            value={inputYear}
                            onChange={(e) => setInputYear(e.target.value)}
                            onBlur={handleYearChangeInYearlyView}
                            onKeyDown={(e) => handleKeyDown(e, handleYearChangeInYearlyView)}
                            autoFocus
                            className="form-control mt-2"
                        />
                    )}
                </div>
            ) : (
                <div>
                    <RenderHeader currentMonth={currentMonth} prevMonth={prevMonth} nextMonth={nextMonth} />
                    <RenderDays />
                    <RenderCells currentMonth={currentMonth} moodColors={moodColors} stickers={stickers} onDateClick={onDateClick} />
                </div>
            )}
        </div>
    );
}

export default Calendar;
