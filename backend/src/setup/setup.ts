
import 'dotenv/config'
import fs from 'node:fs'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import User from '../models/User'
import Car from '../models/Car'
import * as logger from '../utils/logger'
import * as authHelper from '../utils/authHelper'

const demoCarImages: Record<string, string> = {
  'Volkswagen Golf': 'volkswagen-golf.jpg',
  'Toyota Camry': 'toyota-camry.jpg',
  'Tesla Model 3': 'tesla-model-3.jpg',
}

async function restoreDemoCarImages(): Promise<void> {
  const sourceDirectory = path.resolve(process.cwd(), 'scripts/img')

  await asyncFs.mkdir(env.CDN_CARS, { recursive: true })

  for (const [carName, sourceFilename] of Object.entries(demoCarImages)) {
    const sourcePath = path.join(sourceDirectory, sourceFilename)

    if (!fs.existsSync(sourcePath)) {
      logger.warn(`Demo image not found: ${sourcePath}`)
      continue
    }

    const car = await Car.findOne({ name: carName })

    if (!car) {
      logger.info(`Demo car not found; skipping image: ${carName}`)
      continue
    }

    const targetFilename = car.image || `${car._id}.jpg`
    const targetPath = path.join(env.CDN_CARS, targetFilename)

    await asyncFs.copyFile(sourcePath, targetPath)
    logger.info(`Demo image restored: ${carName}`)
  }
}

async function restoreDefaultSupplierImage(): Promise<void> {
  const sourcePath = path.resolve(process.cwd(), 'scripts/img/supplier.png')

  if (!fs.existsSync(sourcePath)) {
    logger.warn(`Default supplier image not found: ${sourcePath}`)
    return
  }

  await asyncFs.mkdir(env.CDN_USERS, { recursive: true })
  const targetPath = path.join(env.CDN_USERS, 'supplier.png')

  if (!fs.existsSync(targetPath)) {
    await asyncFs.copyFile(sourcePath, targetPath)
    logger.info('Default supplier image restored')
  }
}

try {
  const connected = await databaseHelper.connect(
    env.DB_URI,
    env.DB_SSL,
    env.DB_DEBUG,
  )

  if (!connected) {
    logger.error('Failed to connect to the database')
    process.exit(1)
  }

  const adminUser = await User.findOne({ email: env.ADMIN_EMAIL })

  if (!adminUser) {
    const password = 'B00kC4r5'
    const passwordHash = await authHelper.hashPassword(password)

    const newAdmin = new User({
      fullName: 'admin',
      email: env.ADMIN_EMAIL,
      password: passwordHash,
      language: env.DEFAULT_LANGUAGE,
      type: bookcarsTypes.UserType.Admin,
      active: true,
      verified: true,
    })

    await newAdmin.save()
    logger.info('Admin user created successfully')
  } else {
    logger.info('Admin user already exists')
  }

  await restoreDemoCarImages()
  await restoreDefaultSupplierImage()
  process.exit(0)
} catch (err) {
  logger.error('Error during setup:', err)
  process.exit(1)
}
