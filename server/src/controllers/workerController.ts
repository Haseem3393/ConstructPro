import { Request, Response } from 'express'
import prisma from '../config/database'

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(workers)
  } catch (error) {
    console.error('Error fetching workers:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createWorker = async (req: Request, res: Response) => {
  try {
    const { name, trade, dailyWage, phone, address } = req.body

    if (!name || !trade || !dailyWage) {
      return res.status(400).json({ error: 'Required fields: name, trade, dailyWage' })
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        trade,
        dailyWage: parseFloat(dailyWage),
        phone,
        address,
      },
    })

    res.status(201).json(worker)
  } catch (error) {
    console.error('Error creating worker:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const worker = await prisma.worker.findUnique({
      where: { id },
    })
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' })
    }
    res.json(worker)
  } catch (error) {
    console.error('Error fetching worker:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, trade, dailyWage, phone, address, active } = req.body

    const existingWorker = await prisma.worker.findUnique({
      where: { id },
    })

    if (!existingWorker) {
      return res.status(404).json({ error: 'Worker not found' })
    }

    const updatedWorker = await prisma.worker.update({
      where: { id },
      data: {
        name,
        trade,
        dailyWage: dailyWage !== undefined ? parseFloat(dailyWage) : undefined,
        phone,
        address,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    })

    res.json(updatedWorker)
  } catch (error) {
    console.error('Error updating worker:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existingWorker = await prisma.worker.findUnique({
      where: { id },
    })

    if (!existingWorker) {
      return res.status(404).json({ error: 'Worker not found' })
    }

    await prisma.worker.delete({
      where: { id },
    })

    res.json({ message: 'Worker deleted successfully' })
  } catch (error) {
    console.error('Error deleting worker:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getWorkerAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const records = await prisma.attendance.findMany({
      where: { workerId: id },
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' },
    })
    res.json(records)
  } catch (error) {
    console.error('Error fetching worker attendance history:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
