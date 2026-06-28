import { Request, Response } from 'express'
import prisma from '../config/database'
import { logAudit } from '../utils/audit'

// 1. Company Settings
export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: 'company-settings' },
    })

    if (!settings) {
      // Create defaults
      settings = await prisma.companySettings.create({
        data: {
          id: 'company-settings',
          name: 'Munaf & Sons Contractors',
          address: 'Kandy Road, Colombo',
          phone: '+94 11 234 5678',
          email: 'info@munafandsons.com',
          vatNo: 'VAT-1234567-89',
          currency: 'LKR',
          workingDays: 'Mon-Sat',
        },
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Error fetching company settings:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const { name, logoUrl, address, phone, email, vatNo, currency, workingDays } = req.body
    const user = req.user

    const settings = await prisma.companySettings.upsert({
      where: { id: 'company-settings' },
      update: {
        name,
        logoUrl,
        address,
        phone,
        email,
        vatNo,
        currency,
        workingDays,
      },
      create: {
        id: 'company-settings',
        name,
        logoUrl,
        address,
        phone,
        email,
        vatNo,
        currency,
        workingDays,
      },
    })

    await logAudit(user?.id, user?.name || 'Admin', 'UPDATE', 'Settings', 'Updated company profile details')

    res.json(settings)
  } catch (error) {
    console.error('Error updating company settings:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// 2. Categories settings (dynamic)
export const getCategories = async (req: Request, res: Response) => {
  try {
    let categories = await prisma.categorySetting.findMany({
      orderBy: { name: 'asc' },
    })

    // Seed initial categories if none exist
    if (categories.length === 0) {
      const initialSeed = [
        { type: 'UNIT', name: 'bags' },
        { type: 'UNIT', name: 'kg' },
        { type: 'UNIT', name: 'pieces' },
        { type: 'UNIT', name: 'm³' },
        { type: 'UNIT', name: 'liters' },
        { type: 'BRAND', name: 'CAT' },
        { type: 'BRAND', name: 'Komatsu' },
        { type: 'BRAND', name: 'JCB' },
        { type: 'ITEM_CATEGORY', name: 'Masonry' },
        { type: 'ITEM_CATEGORY', name: 'Formwork' },
        { type: 'ITEM_CATEGORY', name: 'Equipment' },
        { type: 'ITEM_CATEGORY', name: 'Other' },
        { type: 'ITEM_TYPE', name: 'Cement' },
        { type: 'ITEM_TYPE', name: 'Steel Reinforcement' },
        { type: 'ITEM_TYPE', name: 'Coarse Sand' },
        { type: 'ITEM_TYPE', name: 'Aggregate' },
        { type: 'EXPENSE_CATEGORY', name: 'LABOUR' },
        { type: 'EXPENSE_CATEGORY', name: 'MATERIAL' },
        { type: 'EXPENSE_CATEGORY', name: 'EQUIPMENT' },
        { type: 'EXPENSE_CATEGORY', name: 'SUBCONTRACTOR' },
        { type: 'EXPENSE_CATEGORY', name: 'TRANSPORT' },
        { type: 'EXPENSE_CATEGORY', name: 'OTHER' }
      ]

      await prisma.categorySetting.createMany({
        data: initialSeed,
        skipDuplicates: true
      })

      categories = await prisma.categorySetting.findMany({
        orderBy: { name: 'asc' },
      })
    }

    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories settings:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createCategorySetting = async (req: Request, res: Response) => {
  try {
    const { type, name } = req.body
    const user = req.user

    if (!type || !name) {
      return res.status(400).json({ error: 'type and name are required' })
    }

    const existing = await prisma.categorySetting.findUnique({
      where: {
        type_name: { type, name }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'This category setting already exists' })
    }

    const category = await prisma.categorySetting.create({
      data: { type, name },
    })

    await logAudit(user?.id, user?.name || 'Admin', 'CREATE', 'Settings', `Added ${type}: ${name}`)

    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating category setting:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteCategorySetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user

    const category = await prisma.categorySetting.findUnique({
      where: { id },
    })

    if (!category) {
      return res.status(404).json({ error: 'Category setting not found' })
    }

    const { type, name } = category

    // Block deletion if records exist that reference this category
    if (type === 'ITEM_CATEGORY') {
      const referenced = await prisma.material.count({ where: { category: name } })
      if (referenced > 0) {
        return res.status(400).json({ error: `Cannot delete: ${referenced} material lines currently reference this category` })
      }
    } else if (type === 'ITEM_TYPE') {
      const referenced = await prisma.material.count({ where: { itemType: name } })
      if (referenced > 0) {
        return res.status(400).json({ error: `Cannot delete: ${referenced} materials currently reference this item type` })
      }
    } else if (type === 'UNIT') {
      const referenced = await prisma.material.count({ where: { unit: name } })
      if (referenced > 0) {
        return res.status(400).json({ error: `Cannot delete: ${referenced} materials currently reference this unit` })
      }
    } else if (type === 'BRAND') {
      const referenced = await prisma.machinery.count({ where: { brand: name } })
      if (referenced > 0) {
        return res.status(400).json({ error: `Cannot delete: ${referenced} machinery items currently reference this brand` })
      }
    } else if (type === 'EXPENSE_CATEGORY') {
      // Enums are set in code; just a warning check
      const referenced = await prisma.expense.count({ where: { category: name as any } })
      if (referenced > 0) {
        return res.status(400).json({ error: `Cannot delete: ${referenced} expense ledger records reference this category` })
      }
    }

    await prisma.categorySetting.delete({
      where: { id },
    })

    await logAudit(user?.id, user?.name || 'Admin', 'DELETE', 'Settings', `Deleted ${type}: ${name}`)

    res.json({ message: 'Category setting deleted successfully' })
  } catch (error) {
    console.error('Error deleting category setting:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// 3. Role Permissions matrix
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    let permissions = await prisma.rolePermission.findMany()

    if (permissions.length === 0) {
      // Seed initial permissions per role
      const initialSeed = [
        {
          role: 'ADMIN',
          permissions: {
            dashboard: { view: true, create: true, edit: true, delete: true },
            projects: { view: true, create: true, edit: true, delete: true },
            materials: { view: true, create: true, edit: true, delete: true },
            machinery: { view: true, create: true, edit: true, delete: true },
            finance: { view: true, create: true, edit: true, delete: true },
            contracts: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, create: true, edit: true, delete: true },
            settings: { view: true, create: true, edit: true, delete: true },
          },
        },
        {
          role: 'PROJECT_MANAGER',
          permissions: {
            dashboard: { view: true, create: false, edit: false, delete: false },
            projects: { view: true, create: true, edit: true, delete: false },
            materials: { view: true, create: true, edit: true, delete: false },
            machinery: { view: true, create: true, edit: true, delete: false },
            finance: { view: true, create: true, edit: true, delete: false },
            contracts: { view: true, create: true, edit: true, delete: false },
            reports: { view: true, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
          },
        },
        {
          role: 'SUPERVISOR',
          permissions: {
            dashboard: { view: false, create: false, edit: false, delete: false },
            projects: { view: true, create: false, edit: false, delete: false },
            materials: { view: true, create: false, edit: true, delete: false },
            machinery: { view: true, create: false, edit: true, delete: false },
            finance: { view: false, create: false, edit: false, delete: false },
            contracts: { view: false, create: false, edit: false, delete: false },
            reports: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
          },
        },
        {
          role: 'CLIENT',
          permissions: {
            dashboard: { view: false, create: false, edit: false, delete: false },
            projects: { view: false, create: false, edit: false, delete: false },
            materials: { view: false, create: false, edit: false, delete: false },
            machinery: { view: false, create: false, edit: false, delete: false },
            finance: { view: false, create: false, edit: false, delete: false },
            contracts: { view: false, create: false, edit: false, delete: false },
            reports: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
          },
        },
      ]

      for (const p of initialSeed) {
        await prisma.rolePermission.create({
          data: {
            role: p.role,
            permissions: p.permissions as any,
          },
        })
      }

      permissions = await prisma.rolePermission.findMany()
    }

    res.json(permissions)
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { role, permissions } = req.body
    const user = req.user

    if (!role || !permissions) {
      return res.status(400).json({ error: 'role and permissions matrix JSON are required' })
    }

    if (role === 'ADMIN') {
      return res.status(400).json({ error: 'Admin permissions are locked and cannot be modified.' })
    }

    const updated = await prisma.rolePermission.upsert({
      where: { role },
      update: { permissions },
      create: { role, permissions },
    })

    await logAudit(user?.id, user?.name || 'Admin', 'UPDATE', 'Settings', `Updated permissions matrix for role: ${role}`)

    res.json(updated)
  } catch (error) {
    console.error('Error updating role permissions:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
