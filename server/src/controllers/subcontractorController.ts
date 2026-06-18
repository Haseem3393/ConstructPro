import { Request, Response } from 'express'
import prisma from '../config/database'

export const getSubcontractors = async (req: Request, res: Response) => {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(subcontractors)
  } catch (error) {
    console.error('Error fetching subcontractors:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createSubcontractor = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Subcontractor name is required' })
    }

    // Check uniqueness
    const existing = await prisma.subcontractor.findUnique({
      where: { name },
    })

    if (existing) {
      return res.status(400).json({ error: 'Subcontractor name already exists' })
    }

    const subcontractor = await prisma.subcontractor.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    })

    res.status(201).json(subcontractor)
  } catch (error) {
    console.error('Error creating subcontractor:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
