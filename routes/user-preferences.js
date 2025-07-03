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

router.get('/filter/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    const { temperatura, clima } = req.query;

    if (usuario_id === null) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
    }

    try {
        let query = supabase
            .from('actividad_usuario')
            .select(`
                *,
                actividades (
                    id,
                    nombre,
                    tipo,
                    descripcion,
                    min_temp,
                    max_temp,
                    prefiere_soleado,
                    prefiere_nublado,
                    prefiere_lluvia
                )
            `)
            .eq('usuario_id', usuario_id);

        // Filtrar por temperatura
        if (temperatura && !isNaN(temperatura)) {
            const temp = parseFloat(temperatura);
            query = query
                .lte('actividades.min_temp', temp)
                .gte('actividades.max_temp', temp);
        }

        // Filtrar por clima
        if (clima) {
            const climaNormalizado = clima.toLowerCase();
            switch (climaNormalizado) {
                case 'soleado':
                case 'despejado':
                case 'clear':
                    query = query.eq('actividades.prefiere_soleado', true);
                    break;
                case 'nublado':
                case 'nubes':
                case 'clouds':
                case 'cloudy':
                    query = query.eq('actividades.prefiere_nublado', true);
                    break;
                case 'lluvioso':
                case 'lluvia':
                case 'rain':
                case 'rainy':
                    query = query.eq('actividades.prefiere_lluvia', true);
                    break;
                default:
                    // Si no coincide con ningún clima conocido, no aplicar filtro
                    console.log(`Clima no reconocido: ${clima}`);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error filtering user preferences:', error);
            return res.status(500).json({ error: 'Error al filtrar las preferencias del usuario' });
        }

        res.status(200).json({
            message: 'Preferencias filtradas exitosamente',
            filters: {
                temperatura: temperatura ? parseFloat(temperatura) : null,
                clima: clima || null
            },
            count: data.length,
            preferences: data
        });
    } catch (error) {
        console.error('Error in /user-preferences/filter/:usuario_id GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/notrecommended/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    const { temperatura, clima } = req.query;

    if (!usuario_id) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
    }

    if (!temperatura && !clima) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un filtro: temperatura o clima' });
    }

    try {
        const temp = parseFloat(temperatura);
        let climaField = null;
        if(clima){
            const climaNormalizado = clima.toLowerCase();
            switch (climaNormalizado) {
                case 'soleado':
                case 'despejado':
                case 'clear':
                    climaField = 'prefiere_soleado';
                    break;
                case 'nublado':
                case 'nubes':
                case 'clouds':
                case 'cloudy':
                    climaField = 'prefiere_nublado';
                    break;
                case 'lluvioso':
                case 'lluvia':
                case 'rain':
                case 'rainy':
                    climaField = 'prefiere_lluvia';
                    break;
                default:
                    climaField = null;
            }
        }
        let filter = '';
        if (temperatura && !isNaN(temperatura)){
            filter = `min_temp.gt.${temp},max_temp.lt.${temp}`;
            if (clima) {
                filter += `,${climaField}.eq.false`;
            }
        }else{
            if (clima) {
                filter = `${climaField}.eq.false`;
            }
        }
        console.log('climaField:', climaField, 'filter:', filter);
        let query = supabase
            .from('actividad_usuario')
            .select(`
                *,
                actividades (
                    id,
                    nombre,
                    tipo,
                    descripcion,
                    min_temp,
                    max_temp,
                    prefiere_soleado,
                    prefiere_nublado,
                    prefiere_lluvia
                )
            `)
            .eq('usuario_id', usuario_id)
        
        if (filter) {
            query = query.or(filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error filtering user preferences:', error);
            return res.status(500).json({ error: 'Error al filtrar las preferencias del usuario' });
        }

        res.status(200).json({
            message: 'Preferencias filtradas exitosamente',
            filters: {
                temperatura: temperatura ? parseFloat(temperatura) : null,
                clima: clima || null
            },
            count: data.length,
            notRecommended: data
        });
    } catch (error) {
        console.error('Error in /user-preferences/filter/:usuario_id GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:usuario_id', async (req, res) => { // Obtener preferencias de usuario por ID
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
    }

    try {
        const { data, error } = await supabase
            .from('actividad_usuario')
            .select(`
                *,
                actividades (
                    id,
                    nombre,
                    tipo
                )
            `)
            .eq('usuario_id', usuario_id);

        if (error) {
            console.error('Error fetching user preferences:', error);
            return res.status(500).json({ error: 'Error al obtener las preferencias del usuario' });
        }

        res.status(200).json({
            message: 'Preferencias obtenidas exitosamente',
            preferences: data
        });
    } catch (error) {
        console.error('Error in /user-preferences/:usuario_id GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {//Agregar nueva actividad preferida
    const { 
        usuario_id, 
        actividad_id, 
        min_temp, 
        max_temp, 
        prefiere_soleado, 
        prefiere_nublado, 
        prefiere_lluvia 
    } = req.body;

    // Validaciones
    if (!usuario_id || !actividad_id) {
        return res.status(400).json({ 
            error: 'usuario_id y actividad_id son requeridos' 
        });
    }

    if (min_temp === undefined || max_temp === undefined) {
        return res.status(400).json({ 
            error: 'min_temp y max_temp son requeridos' 
        });
    }

    if (min_temp > max_temp) {
        return res.status(400).json({ 
            error: 'min_temp no puede ser mayor que max_temp' 
        });
    }

    try {
        // Verificar si ya existe una preferencia para este usuario y actividad
        const { data: existing, error: checkError } = await supabase
            .from('actividad_usuario')
            .select('id')
            .eq('usuario_id', usuario_id)
            .eq('actividad_id', actividad_id);

        if (checkError) {
            console.error('Error checking existing preference:', checkError);
            return res.status(500).json({ error: 'Error al verificar preferencias existentes' });
        }

        if (existing && existing.length > 0) {
            return res.status(409).json({ 
                error: 'Ya existe una preferencia para esta actividad. Use PUT para actualizar.' 
            });
        }

        // Insertar nueva preferencia
        const { data, error } = await supabase
            .from('actividad_usuario')
            .insert([{
                usuario_id,
                actividad_id,
                min_temp,
                max_temp,
                prefiere_soleado: prefiere_soleado || false,
                prefiere_nublado: prefiere_nublado || false,
                prefiere_lluvia: prefiere_lluvia || false
            }])
            .select(`
                *,
                actividades (
                    id,
                    nombre,
                    tipo
                )
            `);

        if (error) {
            console.error('Error creating user preference:', error);
            return res.status(500).json({ error: 'Error al crear la preferencia' });
        }

        res.status(201).json({
            message: 'Preferencia creada exitosamente',
            preference: data[0]
        });
    } catch (error) {
        console.error('Error in /user-preferences POST:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {//Actualizar preferencia existente
    const { id } = req.params;
    const { 
        min_temp, 
        max_temp, 
        prefiere_soleado, 
        prefiere_nublado, 
        prefiere_lluvia 
    } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID de preferencia es requerido' });
    }

    // Validar que al menos un campo esté presente para actualizar
    if (min_temp === undefined && max_temp === undefined && 
        prefiere_soleado === undefined && prefiere_nublado === undefined && 
        prefiere_lluvia === undefined) {
        return res.status(400).json({ 
            error: 'Al menos un campo debe ser proporcionado para actualizar' 
        });
    }

    try {
        // Construir objeto de actualización solo con campos definidos
        const updateFields = {};
        if (min_temp !== undefined) updateFields.min_temp = min_temp;
        if (max_temp !== undefined) updateFields.max_temp = max_temp;
        if (prefiere_soleado !== undefined) updateFields.prefiere_soleado = prefiere_soleado;
        if (prefiere_nublado !== undefined) updateFields.prefiere_nublado = prefiere_nublado;
        if (prefiere_lluvia !== undefined) updateFields.prefiere_lluvia = prefiere_lluvia;

        // Validar temperaturas si ambas están presentes
        if (updateFields.min_temp !== undefined && updateFields.max_temp !== undefined) {
            if (updateFields.min_temp > updateFields.max_temp) {
                return res.status(400).json({ 
                    error: 'min_temp no puede ser mayor que max_temp' 
                });
            }
        }

        const { data, error } = await supabase
            .from('actividad_usuario')
            .update(updateFields)
            .eq('id', id)
            .select(`
                *,
                actividades (
                    id,
                    nombre,
                    tipo
                )
            `);

        if (error) {
            console.error('Error updating user preference:', error);
            return res.status(500).json({ error: 'Error al actualizar la preferencia' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Preferencia no encontrada' });
        }

        res.status(200).json({
            message: 'Preferencia actualizada exitosamente',
            preference: data[0]
        });
    } catch (error) {
        console.error('Error in /user-preferences/:id PUT:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {//Eliminar preferencia
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de preferencia es requerido' });
    }

    try {
        const { data, error } = await supabase
            .from('actividad_usuario')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error deleting user preference:', error);
            return res.status(500).json({ error: 'Error al eliminar la preferencia' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Preferencia no encontrada' });
        }

        res.status(200).json({
            message: 'Preferencia eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error in /user-preferences/:id DELETE:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
