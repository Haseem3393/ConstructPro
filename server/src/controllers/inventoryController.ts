import { Request, Response } from 'express'
import prisma from '../config/database'

export const getInventoryOverview = async (req: Request, res: Response) => {
  try {
    const totalMaterials = await prisma.material.count()
    
    // Low stock: currentStock <= minimumLevel
    const materials = await prisma.material.findMany({
      include: {
        transactions: {
          where: {
            type: { in: ['STOCK_IN', 'OPENING_STOCK'] },
          },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    const lowStockCount = materials.filter(m => m.currentStock <= m.minimumLevel).length
    const outOfStockCount = materials.filter(m => m.currentStock === 0).length

    // Total value = Σ(currentStock * lastPurchasePrice)
    let totalValue = 0
    materials.forEach((m) => {
      const lastPrice = m.transactions[0]?.unitPrice || 0
      totalValue += m.currentStock * lastPrice
    })

    // Per project summary
    const projects = await prisma.project.findMany({
      include: {
        materials: {
          include: {
            transactions: {
              where: { type: { in: ['STOCK_IN', 'OPENING_STOCK'] } },
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    const projectSummaries = projects.map((p) => {
      let val = 0
      let lowCount = 0
      p.materials.forEach((m) => {
        const price = m.transactions[0]?.unitPrice || 0
        val += m.currentStock * price
        if (m.currentStock <= m.minimumLevel) {
          lowCount += 1
        }
      })

      return {
        projectId: p.id,
        projectName: p.name,
        location: p.location,
        materialsCount: p.materials.length,
        lowStockCount: lowCount,
        totalValue: val,
      }
    })

    res.json({
      totalMaterials,
      lowStockCount,
      outOfStockCount,
      totalValue,
      projectSummaries,
    })
  } catch (error) {
    console.error('Error compiling inventory overview:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getOpeningStock = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query

    const whereClause: any = { type: 'OPENING_STOCK' }
    if (projectId) whereClause.projectId = projectId as string

    const transactions = await prisma.materialTransaction.findMany({
      where: whereClause,
      include: {
        material: {
          select: {
            name: true,
            unit: true,
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    const formatted = transactions.map((t) => ({
      id: t.id,
      projectName: t.material.project.name,
      materialName: t.material.name,
      unit: t.material.unit,
      quantity: t.quantity,
      unitPrice: t.unitPrice,
      total: t.quantity * t.unitPrice,
      date: t.date,
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching opening stocks:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createOpeningStock = async (req: Request, res: Response) => {
  try {
    const { projectId, materialId, quantity, unitPrice } = req.body
    const user = req.user

    if (!projectId || !materialId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'projectId, materialId, quantity, and unitPrice are required' })
    }

    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)

    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Quantity and unit price must be positive numbers' })
    }

    // Verify material
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== projectId) {
      return res.status(404).json({ error: 'Material not found in this project' })
    }

    // Check one-time entry limit per material
    const existing = await prisma.materialTransaction.findFirst({
      where: {
        materialId,
        type: 'OPENING_STOCK',
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Opening stock has already been initialized for this material.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update stock levels
      const updatedMaterial = await tx.material.update({
        where: { id: materialId },
        data: {
          stockIn: { increment: qty },
          currentStock: { increment: qty },
        },
      })

      // 2. Create transaction record
      const transaction = await tx.materialTransaction.create({
        data: {
          materialId,
          type: 'OPENING_STOCK',
          quantity: qty,
          unitPrice: price,
          recordedById: user?.id || null,
          projectId,
          description: 'Initial opening stock ledger registration',
        },
      })

      return { material: updatedMaterial, transaction }
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error initializing opening stock:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { supplierId, status } = req.query

    const whereClause: any = {}
    if (supplierId) whereClause.supplierId = supplierId as string
    if (status) whereClause.status = status as string

    const pos = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: { select: { name: true, shortName: true } },
        project: { select: { name: true } },
        items: {
          include: {
            material: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(pos)
  } catch (error) {
    console.error('Error fetching POs:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        project: { select: { name: true, location: true } },
        items: {
          include: {
            material: true,
          },
        },
      },
    })

    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' })
    }

    res.json(po)
  } catch (error) {
    console.error('Error fetching PO details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { supplierId, projectId, deliveryDateExpected, notes, items, status } = req.body

    if (!supplierId || !projectId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplierId, projectId, and items (non-empty array) are required' })
    }

    // Auto-generate PO number
    const year = new Date().getFullYear()
    const count = await prisma.purchaseOrder.count()
    const poNumber = `PO-${year}-${String(count + 1).padStart(3, '0')}`

    // Calculate total amount
    let totalAmount = 0
    const itemsData = items.map((item: any) => {
      const qty = parseFloat(item.quantity)
      const price = parseFloat(item.unitPrice)
      const lineTotal = qty * price
      totalAmount += lineTotal

      return {
        materialId: item.materialId,
        quantity: qty,
        unitPrice: price,
        total: lineTotal,
      }
    })

    const result = await prisma.$transaction(async (tx) => {
      // Create PO
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          projectId,
          totalAmount,
          paidAmount: 0,
          status: status || 'DRAFT',
          deliveryDateExpected: deliveryDateExpected ? new Date(deliveryDateExpected) : null,
          notes: notes || null,
        },
      })

      // Create items
      for (const item of itemsData) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          },
        })
      }

      return po
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating PO:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updatePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, paidAmount } = req.body
    const user = req.user

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { material: true },
        },
      },
    })

    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' })
    }

    // If changing paid amount
    const updatedPaid = paidAmount !== undefined ? parseFloat(paidAmount) : po.paidAmount

    const result = await prisma.$transaction(async (tx) => {
      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: status || undefined,
          paidAmount: updatedPaid,
        },
      })

      // If status changed to RECEIVED and it wasn't RECEIVED before
      if (status === 'RECEIVED' && po.status !== 'RECEIVED') {
        for (const item of po.items) {
          // 1. Update stock levels
          await tx.material.update({
            where: { id: item.materialId },
            data: {
              stockIn: { increment: item.quantity },
              currentStock: { increment: item.quantity },
            },
          })

          // 2. Log transaction
          await tx.materialTransaction.create({
            data: {
              materialId: item.materialId,
              type: 'STOCK_IN',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              date: new Date(),
              supplierId: po.supplierId,
              description: `PO Delivery stock-in (Ref: ${po.poNumber})`,
              autoExpense: true,
              recordedById: user?.id || null,
              projectId: po.projectId,
            },
          })
        }

        // Create expense entry
        await tx.expense.create({
          data: {
            projectId: po.projectId,
            category: 'MATERIAL',
            amount: po.totalAmount,
            description: `Purchase order delivery materials (PO: ${po.poNumber})`,
            date: new Date(),
            createdById: user?.id || null,
            isAuto: true,
          },
        })
      }

      return updatedPO
    })

    res.json(result)
  } catch (error) {
    console.error('Error updating PO status:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getUsageLogs = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query

    const whereClause: any = { type: 'STOCK_OUT' }
    if (projectId) whereClause.projectId = projectId as string

    const logs = await prisma.materialTransaction.findMany({
      where: whereClause,
      include: {
        material: {
          select: {
            name: true,
            unit: true,
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    const formatted = logs.map((log) => ({
      id: log.id,
      projectName: log.material.project.name,
      materialName: log.material.name,
      quantity: log.quantity,
      unit: log.material.unit,
      date: log.date,
      description: log.description,
      recordedBy: 'Site Supervisor', // can query user name if recordedById is linked
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error compiling usage logs:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getTransfers = async (req: Request, res: Response) => {
  try {
    const transfers = await prisma.materialTransfer.findMany({
      include: {
        fromProject: { select: { name: true } },
        toProject: { select: { name: true } },
        material: { select: { name: true, unit: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(transfers)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { fromProjectId, toProjectId, materialId, quantity } = req.body

    if (!fromProjectId || !toProjectId || !materialId || !quantity) {
      return res.status(400).json({ error: 'fromProjectId, toProjectId, materialId, and quantity are required' })
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Transfer quantity must be a positive number' })
    }

    // Verify material in fromProject
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material || material.projectId !== fromProjectId) {
      return res.status(404).json({ error: 'Material not found in source project' })
    }

    if (qty > material.currentStock) {
      return res.status(400).json({ error: `Insufficient stock. Source has ${material.currentStock} ${material.unit} available.` })
    }

    const transfer = await prisma.materialTransfer.create({
      data: {
        fromProjectId,
        toProjectId,
        materialId,
        quantity: qty,
        status: 'PENDING',
      },
    })

    res.status(201).json(transfer)
  } catch (error) {
    console.error('Error requesting transfer:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const approveTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user

    // Admin authorization
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can approve stock transfers.' })
    }

    const transfer = await prisma.materialTransfer.findUnique({
      where: { id },
      include: {
        material: true,
      },
    })

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer order not found' })
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Transfer has already been processed' })
    }

    // Double check stock levels in source project
    const sourceMaterial = await prisma.material.findUnique({
      where: { id: transfer.materialId },
    })

    if (!sourceMaterial || sourceMaterial.currentStock < transfer.quantity) {
      return res.status(400).json({ error: 'Source project has insufficient stock to complete this transfer.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create matching material in destination project
      let destMaterial = await tx.material.findFirst({
        where: {
          projectId: transfer.toProjectId,
          name: { equals: sourceMaterial.name, mode: 'insensitive' },
        },
      })

      if (!destMaterial) {
        destMaterial = await tx.material.create({
          data: {
            name: sourceMaterial.name,
            unit: sourceMaterial.unit,
            category: sourceMaterial.category,
            itemType: sourceMaterial.itemType,
            minimumLevel: sourceMaterial.minimumLevel,
            projectId: transfer.toProjectId,
            currentStock: 0,
            stockIn: 0,
            stockOut: 0,
          },
        })
      }

      // 2. Decrement source project stock
      await tx.material.update({
        where: { id: transfer.materialId },
        data: {
          stockOut: { increment: transfer.quantity },
          currentStock: { decrement: transfer.quantity },
        },
      })

      // 3. Increment destination project stock
      await tx.material.update({
        where: { id: destMaterial.id },
        data: {
          stockIn: { increment: transfer.quantity },
          currentStock: { increment: transfer.quantity },
        },
      })

      // 4. Log transactions
      // Outflow
      await tx.materialTransaction.create({
        data: {
          materialId: transfer.materialId,
          type: 'TRANSFER_OUT',
          quantity: transfer.quantity,
          date: new Date(),
          description: `Stock transfer to project ID: ${transfer.toProjectId}`,
          recordedById: user.id,
          projectId: transfer.fromProjectId,
        },
      })

      // Inflow
      await tx.materialTransaction.create({
        data: {
          materialId: destMaterial.id,
          type: 'TRANSFER_IN',
          quantity: transfer.quantity,
          date: new Date(),
          description: `Stock transfer from project ID: ${transfer.fromProjectId}`,
          recordedById: user.id,
          projectId: transfer.toProjectId,
        },
      })

      // 5. Update transfer status
      const updated = await tx.materialTransfer.update({
        where: { id: transfer.id },
        data: {
          status: 'APPROVED',
          approvedById: user.id,
        },
      })

      return updated
    })

    res.json(result)
  } catch (error) {
    console.error('Error approving transfer:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
