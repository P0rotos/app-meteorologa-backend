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

module.exports = router;
