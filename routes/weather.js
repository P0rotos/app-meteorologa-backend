const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const daily = require('../functions/DailyForecast');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

if (!supabaseUrl || !supabaseKey || !WEATHER_API_KEY) {
    console.error('SUPABASE_URL, SUPABASE_KEY and WEATHER_API_KEY must be defined in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

router.use(express.json());

router.get('/hourly', async (req, res) => {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&cnt=80`;
    const responseF = await fetch(WEATHER_API_URL);
    const jsonF = await responseF.json();
    if (!responseF.ok) {
        return res.status(responseF.status).json({ error: 'Error fetching data from weather API' });
    }
    res.status(200).json(jsonF.list.slice(0, 7));
});

router.get('/daily', async (req, res) => {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&cnt=80`;
    const responseF = await fetch(WEATHER_API_URL);
    const jsonF = await responseF.json();
    if (!responseF.ok) {
        return res.status(responseF.status).json({ error: 'Error fetching data from weather API' });
    }
    const dailyForecasts = daily.getDailyForecasts(jsonF.list).slice(1);
    res.status(200).json(dailyForecasts);
});

router.get('/cities', async (req, res) => {
    const { city } = req.body;
    if( !city) {
        return res.status(400).json({ error: 'City is required' });
    }   
    try{
        const { data, error } = await supabase
            .from('ciudades')
            .select('nombre')
            .ilike('nombre', `%${city}%`);
        
        if (error) {
            console.error('Error fetching cities:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in /weather/cities:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/cords', async (req, res) => {
    const { city } = req.body;
    if( !city) {
        return res.status(400).json({ error: 'City is required' });
    }   
    try{
        const { data, error } = await supabase
            .from('ciudades')
            .select('lat, lon')
            .eq('nombre', city);
        if (error) {
            console.error('Error fetching coordinates:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in /weather/cords:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;