import { Request, Response } from 'express'
import prisma from '../config/database'
import { logAudit } from '../utils/audit'

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { projectId, category, search } = req.query

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId as string
    if (category) whereClause.category = category as string
    
    if (search) {
      whereClause.name = {
        contains: search as string,
        mode: 'insensitive',
      }
    }

    const materials = await prisma.material.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        supplierRef: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    })

    res.json(materials)
  } catch (error) {
    console.error('Error fetching global materials:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        project: { select: { name: true, location: true } },
        supplierRef: true,
        transactions: {
          include: {
            supplier: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    res.json(material)
  } catch (error) {
    console.error('Error fetching material details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getProjectMaterials = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const materials = await prisma.material.findMany({
      where: { projectId },
      include: {
        supplierRef: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    })

    res.json(materials)
  } catch (error) {
    console.error('Error fetching project materials:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createProjectMaterial = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const { name, unit, category, itemType, minimumLevel, supplierId, supplier } = req.body

    if (!name || !unit) {
      return res.status(400).json({ error: 'Name and unit are required fields' })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Check duplicate name + project check
    const existing = await prisma.material.findFirst({
      where: {
        projectId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'A material with this name already exists in the project.' })
    }

    const material = await prisma.material.create({
      data: {
        name,
        unit,
        category: category || 'Other',
        itemType: itemType || 'consumables',
        minimumLevel: minimumLevel ? parseFloat(minimumLevel) : 0,
        supplier, // legacy field
        supplierId: supplierId || null,
        projectId,
        currentStock: 0,
        stockIn: 0,
        stockOut: 0,
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Material', `Created material: ${material.name} in project ID: ${projectId}`)

    res.status(201).json(material)
  } catch (error) {
    console.error('Error creating project material:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const recordStockIn = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const materialId = req.params.materialId
    const { quantity, cost, date, description, supplierId, invoiceNumber, autoExpense } = req.body
    const user = req.user

    const quantityNum = parseFloat(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' })
    }

    // Verify project and material existence
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== projectId) {
      return res.status(404).json({ error: 'Material not found in this project' })
    }

    const targetDate = date ? new Date(date) : new Date()

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update stock levels
      const updatedMaterial = await tx.material.update({
        where: { id: materialId },
        data: {
          stockIn: { increment: quantityNum },
          currentStock: { increment: quantityNum },
        },
      })

      // 2. Log transaction
      const unitPrice = cost ? (parseFloat(cost) / quantityNum) : 0
      const transaction = await tx.materialTransaction.create({
        data: {
          materialId,
          type: 'STOCK_IN',
          quantity: quantityNum,
          unitPrice,
          date: targetDate,
          supplierId: supplierId || null,
          invoiceNumber: invoiceNumber || null,
          description: description || `Stock-in of ${quantityNum} ${material.unit}`,
          autoExpense: autoExpense === true || autoExpense === 'true',
          recordedById: user?.id || null,
          projectId,
        },
      })

      // 3. Generate a matching MATERIAL expense if cost is supplied and autoExpense is true
      const costNum = cost ? parseFloat(cost) : 0
      let expenseRecord = null

      if (costNum > 0 && (autoExpense === true || autoExpense === 'true')) {
        expenseRecord = await tx.expense.create({
          data: {
            projectId,
            category: 'MATERIAL',
            amount: costNum,
            description: description || `Stock-in of ${quantityNum} ${material.unit} of ${material.name}`,
            date: targetDate,
            createdById: user?.id || null,
            isAuto: true,
          },
        })
      }

      return { material: updatedMaterial, transaction, expense: expenseRecord }
    })

    await logAudit(user?.id, user?.name || 'System', 'CREATE', 'MaterialTransaction', `Recorded Stock In: ${quantityNum} ${material.unit} of ${material.name} in project ID: ${projectId}`)

    res.json(result)
  } catch (error) {
    console.error('Error recording stock-in:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const recordStockOut = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const materialId = req.params.materialId
    const { quantity, date, description } = req.body
    const user = req.user

    const quantityNum = parseFloat(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' })
    }

    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== projectId) {
      return res.status(404).json({ error: 'Material not found in this project' })
    }

    if (quantityNum > material.currentStock) {
      return res.status(400).json({ error: `Insufficient stock. Current stock is ${material.currentStock} ${material.unit}` })
    }

    const targetDate = date ? new Date(date) : new Date()

    const result = await prisma.$transaction(async (tx) => {
      // Update stock levels
      const updatedMaterial = await tx.material.update({
        where: { id: materialId },
        data: {
          stockOut: { increment: quantityNum },
          currentStock: { decrement: quantityNum },
        },
      })

      // Log transaction
      const transaction = await tx.materialTransaction.create({
        data: {
          materialId,
          type: 'STOCK_OUT',
          quantity: quantityNum,
          date: targetDate,
          description: description || `Stock-out of ${quantityNum} ${material.unit}`,
          recordedById: user?.id || null,
          projectId,
        },
      })

      return { material: updatedMaterial, transaction }
    })

    await logAudit(user?.id, user?.name || 'System', 'CREATE', 'MaterialTransaction', `Recorded Stock Out: ${quantityNum} ${material.unit} of ${material.name} in project ID: ${projectId}`)

    res.json(result)
  } catch (error) {
    console.error('Error recording stock-out:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateProjectMaterial = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const materialId = req.params.materialId
    const { name, unit, category, itemType, minimumLevel, supplierId, supplier } = req.body

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== projectId) {
      return res.status(404).json({ error: 'Material not found in this project' })
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: materialId },
      data: {
        name: name || undefined,
        unit: unit || undefined,
        category: category !== undefined ? category : undefined,
        itemType: itemType !== undefined ? itemType : undefined,
        minimumLevel: minimumLevel !== undefined ? parseFloat(minimumLevel) : undefined,
        supplierId: supplierId !== undefined ? supplierId : undefined,
        supplier: supplier !== undefined ? supplier : undefined,
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'Material', `Updated material: ${updatedMaterial.name} in project ID: ${projectId}`)

    res.json(updatedMaterial)
  } catch (error) {
    console.error('Error updating material:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteProjectMaterial = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const materialId = req.params.materialId

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== projectId) {
      return res.status(404).json({ error: 'Material not found in this project' })
    }

    await prisma.material.delete({
      where: { id: materialId },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'DELETE', 'Material', `Deleted material ID: ${materialId} in project ID: ${projectId}`)

    res.json({ message: 'Material deleted successfully' })
  } catch (error) {
    console.error('Error deleting material:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
