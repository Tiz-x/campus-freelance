import { Router, Request, Response } from 'express'
import { supabase } from '../supabase'

const router = Router()

// Signup
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, full_name, role } = req.body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role }
    }
  })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ message: 'Signup successful', user: data.user })
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Login successful', session: data.session, user: data.user })
})

export default router