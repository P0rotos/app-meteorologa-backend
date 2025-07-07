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

// GET /actividades-personalizadas/:usuario_id - Obtener actividades personalizadas del usuario
router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
    }

    try {
        const { data, error } = await supabase
            .from('actividades_personalizadas')
            .select('*')
            .eq('usuario_id', usuario_id)
            .order('creado_en', { ascending: false });

        if (error) {
            console.error('Error fetching personal activities:', error);
            return res.status(500).json({ error: 'Error al obtener actividades personalizadas' });
        }

        res.status(200).json({
            message: 'Actividades personalizadas obtenidas exitosamente',
            activities: data || []
        });
    } catch (error) {
        console.error('Error in /actividades-personalizadas/:usuario_id GET:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /actividades-personalizadas - Crear nueva actividad personalizada
router.post('/', async (req, res) => {
    const { usuario_id, nombre, tipo, descripcion, temperatura_min, temperatura_max, prefiere_soleado, prefiere_nublado, prefiere_lluvia } = req.body;
    
    console.log('POST /actividades-personalizadas - Received usuario_id:', usuario_id);

    // Validaciones
    if (!usuario_id || !nombre || !tipo || temperatura_min === undefined || temperatura_max === undefined) {
        return res.status(400).json({ 
            error: 'usuario_id, nombre, tipo, temperatura_min y temperatura_max son requeridos' 
        });
    }

    if (temperatura_min > temperatura_max) {
        return res.status(400).json({ 
            error: 'La temperatura mínima no puede ser mayor que la máxima' 
        });
    }

    // Al menos una preferencia climática debe ser true
    if (!prefiere_soleado && !prefiere_nublado && !prefiere_lluvia) {
        return res.status(400).json({ 
            error: 'Debe seleccionar al menos una preferencia climática' 
        });
    }

    // Validar tipo
    if (!['indoor', 'outdoor'].includes(tipo)) {
        return res.status(400).json({ 
            error: 'El tipo debe ser "indoor" o "outdoor"' 
        });
    }

    try {
        // Verificar si ya existe una actividad personalizada con el mismo nombre para este usuario
        const { data: existingActivity, error: checkError } = await supabase
            .from('actividades_personalizadas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .eq('nombre', nombre)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking existing personal activity:', checkError);
            return res.status(500).json({ error: 'Error al verificar actividad existente' });
        }

        if (existingActivity) {
            return res.status(409).json({ 
                error: 'Ya tienes una actividad personalizada con este nombre' 
            });
        }

        // Crear nueva actividad personalizada  
        console.log('Attempting to insert with auth.users.id:', usuario_id);
        const { data, error } = await supabase
            .from('actividades_personalizadas')
            .insert([{
                usuario_id: usuario_id, // Usar directamente el auth.users.id
                nombre: nombre.trim(),
                tipo,
                descripcion: descripcion?.trim() || '',
                temperatura_min: parseFloat(temperatura_min),
                temperatura_max: parseFloat(temperatura_max),
                prefiere_soleado: prefiere_soleado || false,
                prefiere_nublado: prefiere_nublado || false,
                prefiere_lluvia: prefiere_lluvia || false
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating personal activity:', error);
            return res.status(500).json({ error: 'Error al crear la actividad personalizada' });
        }

        res.status(201).json({
            message: 'Actividad personalizada creada exitosamente',
            activity: data
        });
    } catch (error) {
        console.error('Error in /actividades-personalizadas POST:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /actividades-personalizadas/:id - Actualizar actividad personalizada
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, descripcion, temperatura_min, temperatura_max, prefiere_soleado, prefiere_nublado, prefiere_lluvia } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID de actividad es requerido' });
    }

    try {
        // Verificar que la actividad existe y obtener el usuario_id
        const { data: existingActivity, error: checkError } = await supabase
            .from('actividades_personalizadas')
            .select('*')
            .eq('id', id)
            .single();

        if (checkError || !existingActivity) {
            return res.status(404).json({ error: 'Actividad personalizada no encontrada' });
        }

        // Preparar datos para actualización (solo campos proporcionados)
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (tipo !== undefined) updateData.tipo = tipo;
        if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || '';
        if (temperatura_min !== undefined) updateData.temperatura_min = parseFloat(temperatura_min);
        if (temperatura_max !== undefined) updateData.temperatura_max = parseFloat(temperatura_max);
        if (prefiere_soleado !== undefined) updateData.prefiere_soleado = prefiere_soleado;
        if (prefiere_nublado !== undefined) updateData.prefiere_nublado = prefiere_nublado;
        if (prefiere_lluvia !== undefined) updateData.prefiere_lluvia = prefiere_lluvia;

        // Validar temperaturas si se proporcionan
        const finalMinTemp = updateData.temperatura_min !== undefined ? updateData.temperatura_min : existingActivity.temperatura_min;
        const finalMaxTemp = updateData.temperatura_max !== undefined ? updateData.temperatura_max : existingActivity.temperatura_max;
        
        if (finalMinTemp > finalMaxTemp) {
            return res.status(400).json({ 
                error: 'La temperatura mínima no puede ser mayor que la máxima' 
            });
        }

        // Validar tipo si se proporciona
        if (updateData.tipo && !['indoor', 'outdoor'].includes(updateData.tipo)) {
            return res.status(400).json({ 
                error: 'El tipo debe ser "indoor" o "outdoor"' 
            });
        }

        // Validar que al menos una preferencia climática sea true
        const finalSoleado = updateData.prefiere_soleado !== undefined ? updateData.prefiere_soleado : existingActivity.prefiere_soleado;
        const finalNublado = updateData.prefiere_nublado !== undefined ? updateData.prefiere_nublado : existingActivity.prefiere_nublado;
        const finalLluvia = updateData.prefiere_lluvia !== undefined ? updateData.prefiere_lluvia : existingActivity.prefiere_lluvia;

        if (!finalSoleado && !finalNublado && !finalLluvia) {
            return res.status(400).json({ 
                error: 'Debe seleccionar al menos una preferencia climática' 
            });
        }

        // Verificar nombre duplicado si se está actualizando
        if (updateData.nombre && updateData.nombre !== existingActivity.nombre) {
            const { data: duplicateCheck, error: dupError } = await supabase
                .from('actividades_personalizadas')
                .select('id')
                .eq('usuario_id', existingActivity.usuario_id)
                .eq('nombre', updateData.nombre)
                .neq('id', id)
                .single();

            if (dupError && dupError.code !== 'PGRST116') {
                console.error('Error checking duplicate name:', dupError);
                return res.status(500).json({ error: 'Error al verificar nombre duplicado' });
            }

            if (duplicateCheck) {
                return res.status(409).json({ 
                    error: 'Ya tienes una actividad personalizada con este nombre' 
                });
            }
        }

        // Actualizar actividad
        const { data, error } = await supabase
            .from('actividades_personalizadas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating personal activity:', error);
            return res.status(500).json({ error: 'Error al actualizar la actividad personalizada' });
        }

        res.status(200).json({
            message: 'Actividad personalizada actualizada exitosamente',
            activity: data
        });
    } catch (error) {
        console.error('Error in /actividades-personalizadas/:id PUT:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /actividades-personalizadas/:id - Eliminar actividad personalizada
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de actividad es requerido' });
    }

    try {
        // Verificar que la actividad existe
        const { data: existingActivity, error: checkError } = await supabase
            .from('actividades_personalizadas')
            .select('id, nombre')
            .eq('id', id)
            .single();

        if (checkError || !existingActivity) {
            return res.status(404).json({ error: 'Actividad personalizada no encontrada' });
        }

        // Eliminar actividad
        const { error } = await supabase
            .from('actividades_personalizadas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting personal activity:', error);
            return res.status(500).json({ error: 'Error al eliminar la actividad personalizada' });
        }

        res.status(200).json({
            message: 'Actividad personalizada eliminada exitosamente',
            deletedActivity: existingActivity
        });
    } catch (error) {
        console.error('Error in /actividades-personalizadas/:id DELETE:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;