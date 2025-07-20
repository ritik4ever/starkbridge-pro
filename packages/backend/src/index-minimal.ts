import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'StarkBridge Pro Backend is running! 🚀'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const tokenCount = await prisma.token.count();
    const bridgeCount = await prisma.bridge.count();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        tokens: tokenCount,
        bridges: bridgeCount
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get tokens
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await prisma.token.findMany({
      where: { isActive: true },
      take: 20,
      orderBy: { symbol: 'asc' }
    });

    res.json({
      success: true,
      data: { tokens, total: tokens.length }
    });
  } catch (error) {
    console.error('Failed to get tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tokens'
    });
  }
});

// Get bridges
app.get('/api/bridges', async (req, res) => {
  try {
    const bridges = await prisma.bridge.findMany({
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: bridges
    });
  } catch (error) {
    console.error('Failed to get bridges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bridges'
    });
  }
});

// Simple bridge estimate
app.post('/api/bridge/estimate', express.json(), (req, res) => {
  try {
    const { fromChain, toChain, tokenAddress, amount } = req.body;
    
    if (!fromChain || !toChain || !tokenAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Mock estimate
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.003; // 0.3% fee
    const amountOut = amountNum - fee;
    
    const estimate = {
      estimatedTime: 900, // 15 minutes
      fees: {
        networkFee: '0.001',
        bridgeFee: fee.toString(),
        totalFee: (0.001 + fee).toString()
      },
      amountOut: amountOut.toString(),
      route: [{
        from: fromChain,
        to: toChain,
        bridge: 'StarkBridge Pro'
      }]
    };

    res.json({
      success: true,
      data: estimate
    });
  } catch (error) {
    console.error('Failed to get estimate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get estimate'
    });
  }
});

// Error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 API test: http://localhost:${PORT}/api/test-db`);
      console.log(`📊 Tokens: http://localhost:${PORT}/api/tokens`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();