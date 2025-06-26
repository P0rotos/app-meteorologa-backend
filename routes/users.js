const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log(supabaseUrl);
    console.log(supabaseKey);
    console.error('SUPABASE_URL and SUPABASE_KEY must be defined in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

router.use(express.json());

router.get('/getUser',async (req, res) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error){
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in /users GET:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/register',async (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !password || !email) {
        return res.status(400).json({ error: 'Nombre, Password and email are required' });
    }
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: nombre,
                },
            }
        });
        if (error) {
            console.error('Error creating usuario:', error);
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({message: 'usuario created', user: data.user});
    } catch (error) {
        console.error('Error in /users POST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});         

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required' });
    }
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Error logging in usuario:', error);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'usuario logged in', user: data.user, session: data.session });
    } catch (error) {
        console.error('Error in /users login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out usuario:', error);
            return res.status(500).json({ error: 'Failed to log out usuario' });
        }
        res.status(200).json({ message: 'usuario logged out successfully' });
    } catch (error) {
        console.error('Error in /users logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/updatecity/:id', async (req, res) => {
    const { id } = req.params;
    const { city, country } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    if (city === undefined || country === undefined) {
        return res.status(400).json({ error: 'city is required' });
    }
    try {
        const { error } = await supabase.auth.updateUser({
            id,
            data: {
                city: city,
                country: country,
            }
        });
        if (error) {
            console.error('Error updating usuario city:', error);
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ message: 'usuario city updated' });
    } catch (error) {
        console.error('Error in /users PUT:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    try {
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) {
            console.error('Error deleting usuario:', error);
            return res.status(404).json({ error: error.message });
        }
        res.status(200).json({ message: 'usuario deleted Successfully' });
    } catch (error) {
        console.error('Error in /users DELETE:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/*router.route('/')
    .get(async (req, res) => {
        const { Nombre, id } = req.body;
        if (!Nombre && !id) {
            return res.status(400).json({ error: 'Nombre or ID is required' });
        }
        try {
            let query = supabase.from('usuarios').select('*');
            if (id) {
                query = query.eq('id', id);
            }
            if (Nombre) {
                query = query.eq('nombre', Nombre);
            }
            const { data, error } = await query;
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json(data);
        } catch (error) {
            console.error('Error in /users GET:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    .post(async (req, res) => {
        const { nombre, email, password } = req.body;
        if (!nombre || !password || !email) {
            return res.status(400).json({ error: 'Nombre, Password and email are required' });
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: nombre,
                    },
                }
            });
            const { data, error } = await supabase
                .from('usuarios')
                .insert([{ 
                    email, 
                    nombre,
                    password, 
                }])
                .select();
            if (error) {
                console.error('Error creating usuario:', error);
                return res.status(500).json({ error: error.message });
            }
            res.status(201).json({ uid: data[0], nombre, message: 'usuario created' });
        } catch (error) {
            console.error('Error in /users POST:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ id: data[0].id, nombre, message: 'usuario created' });
    })
    .delete(async (req, res) => {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', id)
                .select();
            if (error) {
                console.error('Error deleting usuario:', error);
                return res.status(500).json({ error: error.message });
            }
            if (!data || data.length === 0) {
                return res.status(404).json({ error: 'usuario not found' });
            }
            res.json({ message: 'usuario deleted Successfully' });
        } catch (error) {
            console.error('Error in /users DELETE:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    .put(async (req, res) => {
        const { id, nombre, password, email } = req.body;
        if (nombre === undefined && password === undefined && email === undefined) {
            return res.status(400).json({ error: 'At least one of nombre, password, or email is required for update' });
        }
        try {
            const updateFields = {};
                if (nombre !== undefined) updateFields.nombre = nombre;
                if (password !== undefined) updateFields.password = password;
                if (email !== undefined) updateFields.email = email;
            const { data, error } = await supabase
            .from('usuarios') 
            .update(updateFields)
            .eq('id', id)
            .select(); 
            if (error) {
                console.error('Error updating usuarios:', error);
                return res.status(500).json({ error: 'Failed to update usuarios' });
            }

            if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Usuario not found' });
            }
            res.json(data[0]); 
        } catch (error) {
                console.error('Error in /users PUT', error);
                res.status(500).json({error: "Internal Server Error"});
        }
        res.json({ message: 'usuario updated' });
    });
*/



module.exports = router;