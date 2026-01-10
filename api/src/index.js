import express from 'express'
import cors from 'cors'
import pg from 'pg'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Pool } = pg

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const storageKey = uuidv4()
    const ext = path.extname(file.originalname)
    cb(null, `${storageKey}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
})

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mashboard',
  user: process.env.DB_USER || 'mashboard',
  password: process.env.DB_PASSWORD || 'mashboard',
})

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize database schema
async function initDatabase() {
  const client = await pool.connect()
  try {
    await client.query(`
      -- Habits table
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
        target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
        color VARCHAR(7) DEFAULT '#6366f1',
        icon VARCHAR(50),
        archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Habit completions table
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        completed_at DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completed_at)
      );

      -- Pomodoro sessions table
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id SERIAL PRIMARY KEY,
        task_id VARCHAR(255),
        task_title VARCHAR(255),
        duration INTEGER NOT NULL DEFAULT 1500,
        type VARCHAR(20) NOT NULL DEFAULT 'work',
        completed BOOLEAN DEFAULT false,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      );

      -- Settings table (stores JSON settings per user)
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL DEFAULT 'default',
        settings JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );

      -- Task resources table (links resources to Vikunja tasks)
      CREATE TABLE IF NOT EXISTS task_resources (
        id SERIAL PRIMARY KEY,
        vikunja_task_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Uploaded files table (tracks file uploads for task resources)
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id SERIAL PRIMARY KEY,
        storage_key VARCHAR(255) UNIQUE NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size_bytes INTEGER NOT NULL,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_habit_completions_date
        ON habit_completions(completed_at);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit
        ON habit_completions(habit_id);
      CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_date
        ON pomodoro_sessions(started_at);
      CREATE INDEX IF NOT EXISTS idx_task_resources_task
        ON task_resources(vikunja_task_id);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_key
        ON uploaded_files(storage_key);
    `)
    console.log('Database schema initialized')
  } finally {
    client.release()
  }
}

// ============================================================================
// HABITS API
// ============================================================================

// Get all habits
app.get('/habits', async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true'
    const query = includeArchived
      ? 'SELECT * FROM habits ORDER BY created_at DESC'
      : 'SELECT * FROM habits WHERE archived = false ORDER BY created_at DESC'
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
})

// Create a habit
app.post('/habits', async (req, res) => {
  try {
    const { name, description, frequency, target_days, color, icon } = req.body
    const result = await pool.query(
      `INSERT INTO habits (name, description, frequency, target_days, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, frequency || 'daily', target_days || [0,1,2,3,4,5,6], color || '#6366f1', icon]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ error: 'Failed to create habit' })
  }
})

// Update a habit
app.put('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, frequency, target_days, color, icon, archived } = req.body
    const result = await pool.query(
      `UPDATE habits
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           frequency = COALESCE($3, frequency),
           target_days = COALESCE($4, target_days),
           color = COALESCE($5, color),
           icon = COALESCE($6, icon),
           archived = COALESCE($7, archived),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, frequency, target_days, color, icon, archived, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating habit:', error)
    res.status(500).json({ error: 'Failed to update habit' })
  }
})

// Delete a habit
app.delete('/habits/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
})

// Get habit completions for a date range
app.get('/habits/completions', async (req, res) => {
  try {
    const { start, end, habit_id } = req.query
    let query = `
      SELECT hc.*, h.name as habit_name, h.color as habit_color
      FROM habit_completions hc
      JOIN habits h ON hc.habit_id = h.id
      WHERE 1=1
    `
    const params = []

    if (start) {
      params.push(start)
      query += ` AND hc.completed_at >= $${params.length}`
    }
    if (end) {
      params.push(end)
      query += ` AND hc.completed_at <= $${params.length}`
    }
    if (habit_id) {
      params.push(habit_id)
      query += ` AND hc.habit_id = $${params.length}`
    }

    query += ' ORDER BY hc.completed_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching completions:', error)
    res.status(500).json({ error: 'Failed to fetch completions' })
  }
})

// Mark habit as complete for a date
app.post('/habits/:id/complete', async (req, res) => {
  try {
    const { id } = req.params
    const { date, notes } = req.body
    const completedAt = date || new Date().toISOString().split('T')[0]

    const result = await pool.query(
      `INSERT INTO habit_completions (habit_id, completed_at, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, completed_at) DO UPDATE SET notes = $3
       RETURNING *`,
      [id, completedAt, notes]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error completing habit:', error)
    res.status(500).json({ error: 'Failed to complete habit' })
  }
})

// Uncomplete habit for a date
app.delete('/habits/:id/complete', async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query
    const completedAt = date || new Date().toISOString().split('T')[0]

    await pool.query(
      'DELETE FROM habit_completions WHERE habit_id = $1 AND completed_at = $2',
      [id, completedAt]
    )
    res.json({ success: true })
  } catch (error) {
    console.error('Error uncompleting habit:', error)
    res.status(500).json({ error: 'Failed to uncomplete habit' })
  }
})

// Get habit streaks
app.get('/habits/:id/streak', async (req, res) => {
  try {
    const { id } = req.params

    // Get the habit's target days
    const habitResult = await pool.query('SELECT target_days FROM habits WHERE id = $1', [id])
    if (habitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const targetDays = habitResult.rows[0].target_days

    // Get all completions ordered by date
    const completionsResult = await pool.query(
      'SELECT completed_at FROM habit_completions WHERE habit_id = $1 ORDER BY completed_at DESC',
      [id]
    )

    const completions = new Set(
      completionsResult.rows.map(r => r.completed_at.toISOString().split('T')[0])
    )

    // Calculate current streak
    let currentStreak = 0
    let date = new Date()

    while (true) {
      const dayOfWeek = date.getDay()
      const dateStr = date.toISOString().split('T')[0]

      if (targetDays.includes(dayOfWeek)) {
        if (completions.has(dateStr)) {
          currentStreak++
        } else if (dateStr !== new Date().toISOString().split('T')[0]) {
          // Streak broken (but don't count today as broken if not completed yet)
          break
        }
      }

      date.setDate(date.getDate() - 1)

      // Safety limit
      if (currentStreak > 365) break
    }

    // Calculate longest streak (simplified)
    let longestStreak = currentStreak

    res.json({
      current: currentStreak,
      longest: longestStreak,
      totalCompletions: completions.size
    })
  } catch (error) {
    console.error('Error calculating streak:', error)
    res.status(500).json({ error: 'Failed to calculate streak' })
  }
})

// ============================================================================
// POMODORO API
// ============================================================================

// Get pomodoro sessions
app.get('/pomodoro/sessions', async (req, res) => {
  try {
    const { date, limit } = req.query
    let query = 'SELECT * FROM pomodoro_sessions'
    const params = []

    if (date) {
      params.push(date)
      query += ` WHERE DATE(started_at) = $${params.length}`
    }

    query += ' ORDER BY started_at DESC'

    if (limit) {
      params.push(parseInt(limit))
      query += ` LIMIT $${params.length}`
    }

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// Start a pomodoro session
app.post('/pomodoro/sessions', async (req, res) => {
  try {
    const { task_id, task_title, duration, type } = req.body
    const result = await pool.query(
      `INSERT INTO pomodoro_sessions (task_id, task_title, duration, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [task_id, task_title, duration || 1500, type || 'work']
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Complete a pomodoro session
app.put('/pomodoro/sessions/:id/complete', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE pomodoro_sessions
       SET completed = true, ended_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error completing session:', error)
    res.status(500).json({ error: 'Failed to complete session' })
  }
})

// Get pomodoro stats
app.get('/pomodoro/stats', async (req, res) => {
  try {
    const { period } = req.query // 'today', 'week', 'month'

    let dateFilter = ''
    if (period === 'today') {
      dateFilter = "AND DATE(started_at) = CURRENT_DATE"
    } else if (period === 'week') {
      dateFilter = "AND started_at >= CURRENT_DATE - INTERVAL '7 days'"
    } else if (period === 'month') {
      dateFilter = "AND started_at >= CURRENT_DATE - INTERVAL '30 days'"
    }

    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE type = 'work' AND completed = true) as completed_pomodoros,
        COUNT(*) FILTER (WHERE type = 'work') as total_pomodoros,
        COALESCE(SUM(duration) FILTER (WHERE type = 'work' AND completed = true), 0) as total_focus_time
      FROM pomodoro_sessions
      WHERE 1=1 ${dateFilter}
    `)

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// ============================================================================
// SETTINGS API
// ============================================================================

// Get user settings
app.get('/settings', async (req, res) => {
  try {
    const userId = req.query.userId || 'default'
    const result = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // Return empty settings if none exist
      return res.json({})
    }

    res.json(result.rows[0].settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// Update user settings (full replace)
app.put('/settings', async (req, res) => {
  try {
    const userId = req.query.userId || 'default'
    const settings = req.body

    const result = await pool.query(
      `INSERT INTO user_settings (user_id, settings)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET
         settings = $2,
         updated_at = CURRENT_TIMESTAMP
       RETURNING settings`,
      [userId, JSON.stringify(settings)]
    )

    res.json(result.rows[0].settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

// Patch user settings (partial update)
app.patch('/settings', async (req, res) => {
  try {
    const userId = req.query.userId || 'default'
    const updates = req.body

    // First get existing settings
    const existing = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [userId]
    )

    const currentSettings = existing.rows.length > 0 ? existing.rows[0].settings : {}
    const mergedSettings = { ...currentSettings, ...updates }

    const result = await pool.query(
      `INSERT INTO user_settings (user_id, settings)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET
         settings = $2,
         updated_at = CURRENT_TIMESTAMP
       RETURNING settings`,
      [userId, JSON.stringify(mergedSettings)]
    )

    res.json(result.rows[0].settings)
  } catch (error) {
    console.error('Error patching settings:', error)
    res.status(500).json({ error: 'Failed to patch settings' })
  }
})

// ============================================================================
// TASK RESOURCES API
// ============================================================================

// Get all resources for a task
app.get('/task-resources/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params
    const result = await pool.query(
      'SELECT * FROM task_resources WHERE vikunja_task_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [taskId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching task resources:', error)
    res.status(500).json({ error: 'Failed to fetch task resources' })
  }
})

// Create a task resource
app.post('/task-resources/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params
    const { resource_type, title, config, sort_order } = req.body

    if (!resource_type || !title) {
      return res.status(400).json({ error: 'resource_type and title are required' })
    }

    const result = await pool.query(
      `INSERT INTO task_resources (vikunja_task_id, resource_type, title, config, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [taskId, resource_type, title, JSON.stringify(config || {}), sort_order || 0]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating task resource:', error)
    res.status(500).json({ error: 'Failed to create task resource' })
  }
})

// Update a task resource
app.put('/task-resources/:taskId/:id', async (req, res) => {
  try {
    const { taskId, id } = req.params
    const { resource_type, title, config, sort_order } = req.body

    const result = await pool.query(
      `UPDATE task_resources
       SET resource_type = COALESCE($1, resource_type),
           title = COALESCE($2, title),
           config = COALESCE($3, config),
           sort_order = COALESCE($4, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND vikunja_task_id = $6
       RETURNING *`,
      [resource_type, title, config ? JSON.stringify(config) : null, sort_order, id, taskId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task resource not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating task resource:', error)
    res.status(500).json({ error: 'Failed to update task resource' })
  }
})

// Delete a task resource
app.delete('/task-resources/:taskId/:id', async (req, res) => {
  try {
    const { taskId, id } = req.params

    // First get the resource to check if it has an associated file
    const resourceResult = await pool.query(
      'SELECT * FROM task_resources WHERE id = $1 AND vikunja_task_id = $2',
      [id, taskId]
    )

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task resource not found' })
    }

    const resource = resourceResult.rows[0]

    // If it's a file resource, delete the associated file
    if (resource.resource_type === 'file' && resource.config?.storageKey) {
      const fileResult = await pool.query(
        'DELETE FROM uploaded_files WHERE storage_key = $1 RETURNING file_path',
        [resource.config.storageKey]
      )

      if (fileResult.rows.length > 0 && fileResult.rows[0].file_path) {
        const filePath = path.join(UPLOADS_DIR, path.basename(fileResult.rows[0].file_path))
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    // Delete the resource
    await pool.query('DELETE FROM task_resources WHERE id = $1', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting task resource:', error)
    res.status(500).json({ error: 'Failed to delete task resource' })
  }
})

// Reorder task resources
app.put('/task-resources/:taskId/reorder', async (req, res) => {
  try {
    const { taskId } = req.params
    const { resourceIds } = req.body // Array of resource IDs in new order

    if (!Array.isArray(resourceIds)) {
      return res.status(400).json({ error: 'resourceIds must be an array' })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      for (let i = 0; i < resourceIds.length; i++) {
        await client.query(
          'UPDATE task_resources SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND vikunja_task_id = $3',
          [i, resourceIds[i], taskId]
        )
      }

      await client.query('COMMIT')

      const result = await pool.query(
        'SELECT * FROM task_resources WHERE vikunja_task_id = $1 ORDER BY sort_order ASC',
        [taskId]
      )
      res.json(result.rows)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error reordering task resources:', error)
    res.status(500).json({ error: 'Failed to reorder task resources' })
  }
})

// ============================================================================
// FILE UPLOAD API
// ============================================================================

// Upload a file
app.post('/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { originalname, mimetype, size, filename } = req.file
    const storageKey = path.basename(filename, path.extname(filename))

    const result = await pool.query(
      `INSERT INTO uploaded_files (storage_key, original_name, mime_type, size_bytes, file_path)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [storageKey, originalname, mimetype, size, filename]
    )

    res.status(201).json({
      ...result.rows[0],
      url: `/files/${storageKey}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

// Download/serve a file
app.get('/files/:storageKey', async (req, res) => {
  try {
    const { storageKey } = req.params

    const result = await pool.query(
      'SELECT * FROM uploaded_files WHERE storage_key = $1',
      [storageKey]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = result.rows[0]
    const filePath = path.join(UPLOADS_DIR, file.file_path)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' })
    }

    res.setHeader('Content-Type', file.mime_type)
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`)
    res.sendFile(filePath)
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(500).json({ error: 'Failed to serve file' })
  }
})

// Get file metadata
app.get('/files/:storageKey/meta', async (req, res) => {
  try {
    const { storageKey } = req.params

    const result = await pool.query(
      'SELECT * FROM uploaded_files WHERE storage_key = $1',
      [storageKey]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching file metadata:', error)
    res.status(500).json({ error: 'Failed to fetch file metadata' })
  }
})

// Delete a file
app.delete('/files/:storageKey', async (req, res) => {
  try {
    const { storageKey } = req.params

    const result = await pool.query(
      'DELETE FROM uploaded_files WHERE storage_key = $1 RETURNING *',
      [storageKey]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = result.rows[0]
    const filePath = path.join(UPLOADS_DIR, file.file_path)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

// Start server
async function start() {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`Mashboard API running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
