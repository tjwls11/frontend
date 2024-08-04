import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { fetchUserTags } from './api/api';
import { Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';

// Chart.js의 모든 기본 구성요소 등록
Chart.register(...registerables);

const positiveKeywords = ['행복', '기쁨'];
const neutralKeywords = ['중립'];
const negativeKeywords = ['슬픔', '우울'];

const getEmotionScore = (tag) => {
    if (positiveKeywords.includes(tag)) return 1;
    if (neutralKeywords.includes(tag)) return 0;
    if (negativeKeywords.includes(tag)) return -1;
    return 0; // 기본값
};

const MoodChart = () => {
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
                    }
                } else {
                    setError('토큰이 없습니다.');
                }
            } catch (error) {
                setError('태그 데이터 로딩 중 오류 발생');
            }
        };

        loadMoodTags();
    }, []);

    const tagCounts = moodTags.reduce((acc, { date, tag }) => {
        if (tag) {
            acc[date] = acc[date] || {};
            acc[date][tag] = (acc[date][tag] || 0) + 1;
        }
        return acc;
    }, {});

    const scoreCounts = Object.entries(tagCounts).map(([date, tags]) => {
        const totalScore = Object.entries(tags).reduce((sum, [tag, count]) => {
            return sum + getEmotionScore(tag) * count;
        }, 0);
        return { date, score: totalScore };
    });

    const lineData = {
        labels: scoreCounts.map(item => item.date),
        datasets: [{
            label: '감정 점수',
            data: scoreCounts.map(item => item.score),
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
        }],
    };

    const barData = {
        labels: Object.keys(tagCounts),
        datasets: Object.entries(tagCounts).map(([date, tags]) => ({
            label: date,
            data: Object.values(tags),
            backgroundColor: 'rgba(75,192,192,0.4)',
        })),
    };

    return (
        <Container>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header as="h5">감정 점수 선 그래프</Card.Header>
                        <Card.Body>
                            <Line data={lineData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12}>
                    <Card>
                        <Card.Header as="h5">감정 태그 빈도수 막대 그래프</Card.Header>
                        <Card.Body>
                            <Bar data={barData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MoodChart;
