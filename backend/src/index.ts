import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5196',
    'http://localhost:5198',
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Campus Freelance API is running!' })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app