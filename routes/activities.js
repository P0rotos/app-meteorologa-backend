const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL and SUPABASE_KEY must be defined in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

router.use(express.json());

router.get('/', async (req, res) => { //Obtener todas las actividades
    try {
        const { data, error } = await supabase
            .from('actividades')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error fetching activities:', error);
            return res.status(500).json({ error: 'Error al obtener las actividades' });
        }

        res.status(200).json({
            message: 'Actividades obtenidas exitosamente',
            activities: data
        });
    } catch (error) {
        console.error('Error in /activities GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Nuevo endpoint para filtrar actividades según criterios
router.get('/filter', async (req, res) => {
    const { temperatura, clima } = req.query;

    try {
        let query = supabase.from('actividades').select('*');

        // Criterio 1: Filtrar por temperatura
        if (temperatura && !isNaN(temperatura)) {
            const temp = parseFloat(temperatura);
            query = query
                .lte('min_temp', temp)  // min_temp <= temperatura
                .gte('max_temp', temp); // max_temp >= temperatura
        }

        // Criterio 2: Filtrar por clima
        if (clima) {
            const climaNormalizado = clima.toLowerCase();
            
            switch (climaNormalizado) {
                case 'soleado':
                case 'despejado':
                case 'clear':
                    query = query.eq('prefiere_soleado', true);
                    break;
                case 'nublado':
                case 'nubes':
                case 'clouds':
                case 'cloudy':
                    query = query.eq('prefiere_nublado', true);
                    break;
                case 'lluvioso':
                case 'lluvia':
                case 'rain':
                case 'rainy':
                    query = query.eq('prefiere_lluvia', true);
                    break;
                default:
                    // Si no coincide con ningún clima conocido, no aplicar filtro
                    console.log(`Clima no reconocido: ${clima}`);
            }
        }

        // Ejecutar la consulta
        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) {
            console.error('Error filtering activities:', error);
            return res.status(500).json({ error: 'Error al filtrar las actividades' });
        }

        res.status(200).json({
            message: 'Actividades filtradas exitosamente',
            filters: {
                temperatura: temperatura ? parseFloat(temperatura) : null,
                clima: clima || null
            },
            count: data.length,
            activities: data
        });
    } catch (error) {
        console.error('Error in /activities/filter GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => { //Obtener una actividad por ID
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de actividad es requerido' });
    }

    try {
        const { data, error } = await supabase
            .from('actividades')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching activity:', error);
            return res.status(500).json({ error: 'Error al obtener la actividad' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        res.status(200).json({
            message: 'Actividad obtenida exitosamente',
            activity: data
        });
    } catch (error) {
        console.error('Error in /activities/:id GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint adicional para obtener actividades recomendadas basadas en el clima actual
router.post('/recommend', async (req, res) => {
    const { temperatura, clima, incluirTodasLasCompatibles = false } = req.body;

    if (!temperatura || !clima) {
        return res.status(400).json({ 
            error: 'Se requiere temperatura y clima para generar recomendaciones' 
        });
    }

    try {
        let query = supabase.from('actividades').select('*');

        // Filtrar por temperatura
        const temp = parseFloat(temperatura);
        query = query
            .lte('min_temp', temp)
            .gte('max_temp', temp);

        // Filtrar por clima
        const climaNormalizado = clima.toLowerCase();
        
        // Si incluirTodasLasCompatibles es false, solo mostramos las que prefieren este clima
        // Si es true, mostramos todas las que son compatibles con este clima
        if (!incluirTodasLasCompatibles) {
            switch (climaNormalizado) {
                case 'soleado':
                case 'despejado':
                case 'clear':
                    query = query.eq('prefiere_soleado', true);
                    break;
                case 'nublado':
                case 'nubes':
                case 'clouds':
                case 'cloudy':
                    query = query.eq('prefiere_nublado', true);
                    break;
                case 'lluvioso':
                case 'lluvia':
                case 'rain':
                case 'rainy':
                    query = query.eq('prefiere_lluvia', true);
                    break;
            }
        }

        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) {
            console.error('Error getting recommendations:', error);
            return res.status(500).json({ error: 'Error al obtener recomendaciones' });
        }

        // Categorizar las actividades según su preferencia climática
        const categorizedActivities = {
            perfectas: [],    // Actividades que prefieren este clima
            compatibles: []   // Actividades que se pueden hacer en este clima
        };

        data.forEach(activity => {
            let isPerfect = false;
            
            switch (climaNormalizado) {
                case 'soleado':
                case 'despejado':
                case 'clear':
                    isPerfect = activity.prefiere_soleado;
                    break;
                case 'nublado':
                case 'nubes':
                case 'clouds':
                case 'cloudy':
                    isPerfect = activity.prefiere_nublado;
                    break;
                case 'lluvioso':
                case 'lluvia':
                case 'rain':
                case 'rainy':
                    isPerfect = activity.prefiere_lluvia;
                    break;
            }

            if (isPerfect) {
                categorizedActivities.perfectas.push(activity);
            } else {
                categorizedActivities.compatibles.push(activity);
            }
        });

        res.status(200).json({
            message: 'Recomendaciones generadas exitosamente',
            condiciones: {
                temperatura: temp,
                clima: clima
            },
            recomendaciones: incluirTodasLasCompatibles ? data : categorizedActivities.perfectas,
            todasLasActividades: categorizedActivities,
            totalRecomendaciones: data.length
        });
    } catch (error) {
        console.error('Error in /activities/recommend POST:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
