import React, { useEffect, useState } from 'react';
import HeatMap from 'react-heatmap-grid'; // 'react-heatmap-grid'로 확인한 정확한 컴포넌트 이름
import { fetchUserTags } from './api/api';
import { Container, Row, Col, Alert, Card } from 'react-bootstrap';

const MoodChart = ({ moodColors = {} }) => {
    const [moodTags, setMoodTags] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadMoodTags = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetchUserTags(token);
                    if (response && response.isSuccess) {
                        setMoodTags(response.data.filter(tag => tag.tag));
                    } else {
                        setError(response?.message || '태그 데이터 로딩 실패');
                        console.error('태그 데이터 로딩 실패:', response?.message || '응답 데이터 없음');
                    }
                } else {
                    setError('토큰이 없습니다.');
                    console.error('토큰이 없습니다.');
                }
            } catch (error) {
                setError('태그 데이터 로딩 중 오류 발생');
                console.error('태그 데이터 로딩 중 오류 발생:', error.message || error);
            }
        };

        loadMoodTags();
    }, []);

    // 태그 빈도수 계산하기
    const tagCounts = moodTags.reduce((acc, { tag }) => {
        if (tag) {
            acc[tag] = (acc[tag] || 0) + 1;
        }
        return acc;
    }, {});

    const data = Object.entries(tagCounts).map(([tag, count]) => ({
        tag,
        count,
    }));

    const tags = data.map(item => item.tag);
    const counts = data.map(item => item.count);

    // 히트맵 데이터를 2차원 배열로 변환
    const heatmapData = [counts.map(() => counts)]; // 모든 태그의 빈도수를 가진 2차원 배열

    // 기본 색상 설정 (선택적)
    const defaultColor = '#e0e0e0'; // 기본 색상
    const getColor = (value) => {
        // 값에 따라 색상을 다르게 설정할 수 있음
        if (value > 5) return '#ff5733'; // 예: 빈도가 5를 초과하면 빨간색
        if (value > 1) return '#ffc300'; // 예: 빈도가 1을 초과하면 노란색
        return defaultColor; // 기본 색상
    };

    return (
        <Container>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="mb-4">
                <Col md={12}>
                    {tags.length > 0 && (
                        <Card>
                            <Card.Header as="h5">감정 태그 히트맵</Card.Header>
                            <Card.Body>
                                <div style={{ height: '400px', width: '100%' }}>
                                    <HeatMap
                                        data={heatmapData}
                                        xLabels={tags}
                                        yLabels={['빈도수']}
                                        cellStyle={(value) => ({
                                            background: getColor(value),
                                            fontSize: '11px',
                                        })}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
            {/* 다른 차트들도 동일하게 유지 */}
        </Container>
    );
};

export default MoodChart;
