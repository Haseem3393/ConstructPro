import { Request, Response } from 'express'
import prisma from '../config/database'

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query

    const whereClause: any = {}
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { shortName: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    })

    res.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        materials: {
          select: { id: true, name: true, category: true, unit: true, currentStock: true },
        },
        purchaseOrders: {
          include: {
            project: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' })
    }

    // Calculations
    const validPOs = supplier.purchaseOrders.filter(po => po.status !== 'CANCELLED')
    const totalPurchased = validPOs.reduce((sum, po) => sum + po.totalAmount, 0)
    const outstandingPayables = validPOs.reduce((sum, po) => sum + (po.totalAmount - po.paidAmount), 0)

    res.json({
      ...supplier,
      stats: {
        totalPurchased,
        outstandingPayables,
        poCount: supplier.purchaseOrders.length,
      },
    })
  } catch (error) {
    console.error('Error fetching supplier details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, shortName, phone, email, vatNo, address, paymentTerms } = req.body

    if (!name || !shortName) {
      return res.status(400).json({ error: 'Company Name and Short Name are required fields' })
    }

    // Check unique shortName
    const existingShort = await prisma.supplier.findUnique({
      where: { shortName },
    })
    if (existingShort) {
      return res.status(400).json({ error: 'Supplier short name / code must be unique.' })
    }

    // Check unique VAT number if provided
    if (vatNo) {
      const existingVat = await prisma.supplier.findFirst({
        where: { vatNo },
      })
      if (existingVat) {
        return res.status(400).json({ error: 'Supplier VAT number already registered.' })
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        shortName,
        phone: phone || null,
        email: email || null,
        vatNo: vatNo || null,
        address: address || null,
        paymentTerms: paymentTerms || 'Cash',
      },
    })

    res.status(201).json(supplier)
  } catch (error) {
    console.error('Error creating supplier:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
