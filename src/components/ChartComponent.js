import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ChartComponent = ({ data }) => {
    if (!data || typeof data !== 'object') {
        return <p>데이터가 없습니다</p>; // 데이터가 유효하지 않을 때 대체 UI 렌더링
    }

    const months = Object.keys(data).sort(); // 월을 오름차순으로 정렬
    const colorData = {};

    months.forEach(month => {
        Object.keys(data[month]).forEach(color => {
            if (!colorData[color]) {
                colorData[color] = Array(months.length).fill(0);
            }
            const monthIndex = months.indexOf(month);
            colorData[color][monthIndex] = data[month][color];
        });
    });

    const datasets = Object.keys(colorData).map(color => ({
        label: color,
        data: colorData[color],
        backgroundColor: color,
        stack: '1',
    }));

    const chartData = {
        labels: months,
        datasets: datasets,
    };

    return (
        <div>
            <h3>월별 색상 사용량</h3>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y;
                                    }
                                    return label;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default ChartComponent;
