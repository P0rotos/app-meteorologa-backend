
const getDailyForecasts = (hourlyData) => {
    const dailyForecasts = {};    
    const opcionesDia = {
        day: 'numeric',
        month: 'numeric'
    };

    hourlyData.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString(undefined, opcionesDia);
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
            temps: [],
            icons: [],
            rainOccurrences: 0,
            timestamps: 0,
            };
        }
        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].icons.push(item.weather[0].icon);
        dailyForecasts[date].timestamps++;
        if (item.rain) {
            dailyForecasts[date].rainOccurrences++;
        }
    });

    return Object.keys(dailyForecasts).slice(0, 9).map((date) => {
        const dailyData = dailyForecasts[date];
        const precipitation = (dailyData.rainOccurrences*100)/dailyData.timestamps
        const representativeIcon = dailyData.icons[Math.floor(dailyData.icons.length / 2)]; 
        const maxTemp = Math.max(...dailyData.temps);
        const minTemp = Math.min(...dailyData.temps);
        return {
            date,
            maxTemp,
            minTemp,
            precipitation,
            icon: representativeIcon,
        };
    });
};

module.exports = {
    getDailyForecasts: getDailyForecasts
};