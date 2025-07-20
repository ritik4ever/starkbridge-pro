import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '../index'
import { prisma } from '../lib/database'
import jwt from 'jsonwebtoken'

describe('Bridge API', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        walletAddress: '0x1234567890123456789012345678901234567890',
        email: 'test@example.com',
        preferences: {}
      }
    })
    
    userId = user.id
    authToken = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!
    )
  })

  afterAll(async () => {
    await prisma.bridgeTransaction.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.bridgeTransaction.deleteMany({})
  })

  describe('POST /api/bridge/transactions', () => {
    test('should create bridge transaction', async () => {
      const response = await request(app)
        .post('/api/bridge/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenAddress: '0x1234567890123456789012345678901234567890',
          amount: '1000000000000000000'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.status).toBe('PENDING')
    })

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/bridge/transactions')
        .send({
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenAddress: '0x1234567890123456789012345678901234567890',
          amount: '1000000000000000000'
        })

      expect(response.status).toBe(401)
    })

    test('should validate input fields', async () => {
      const response = await request(app)
        .post('/api/bridge/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromChain: 'invalid',
          toChain: 'starknet',
          tokenAddress: '',
          amount: ''
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/bridge/transactions', () => {
    test('should get user transactions', async () => {
      // Create test transaction
      await prisma.bridgeTransaction.create({
        data: {
          userId,
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenAddress: '0x1234567890123456789012345678901234567890',
          tokenSymbol: 'ETH',
          amount: '1000000000000000000',
          estimatedTime: 900,
          fees: JSON.stringify({
            networkFee: '0.001',
            bridgeFee: '0.003',
            totalFee: '0.004'
          })
        }
      })

      const response = await request(app)
        .get('/api/bridge/transactions')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.data).toHaveLength(1)
      expect(response.body.data.pagination).toBeDefined()
    })

    test('should support pagination', async () => {
      // Create multiple test transactions
      for (let i = 0; i < 25; i++) {
        await prisma.bridgeTransaction.create({
          data: {
            userId,
            fromChain: 'ethereum',
            toChain: 'starknet',
            tokenAddress: '0x1234567890123456789012345678901234567890',
            tokenSymbol: 'ETH',
            amount: '1000000000000000000',
            estimatedTime: 900,
            fees: '{}'
          }
        })
      }

      const response = await request(app)
        .get('/api/bridge/transactions?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.data).toHaveLength(10)
      expect(response.body.data.pagination.page).toBe(2)
      expect(response.body.data.pagination.hasNext).toBe(true)
    })
  })

  describe('POST /api/bridge/estimate', () => {
    test('should return bridge estimate', async () => {
      const response = await request(app)
        .post('/api/bridge/estimate')
        .send({
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenAddress: '0x1234567890123456789012345678901234567890',
          amount: '1000000000000000000'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('estimatedTime')
      expect(response.body.data).toHaveProperty('fees')
      expect(response.body.data).toHaveProperty('amountOut')
    })
  })
})