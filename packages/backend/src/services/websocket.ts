import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/database';
import { Logger } from '@starkbridge/shared';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupWebSocket(io: SocketServer) {
  // Authentication middleware for WebSocket
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    Logger.info(`User ${socket.userId} connected to WebSocket`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Subscribe to transaction updates
    socket.on('subscribe_transactions', () => {
      socket.join(`transactions:${socket.userId}`);
      Logger.debug(`User ${socket.userId} subscribed to transaction updates`);
    });

    // Subscribe to price updates
    socket.on('subscribe_prices', (tokens: string[]) => {
      tokens.forEach(token => {
        socket.join(`price:${token}`);
      });
      Logger.debug(`User ${socket.userId} subscribed to price updates for ${tokens.length} tokens`);
    });

    // Unsubscribe from price updates
    socket.on('unsubscribe_prices', (tokens: string[]) => {
      tokens.forEach(token => {
        socket.leave(`price:${token}`);
      });
    });

    socket.on('disconnect', () => {
      Logger.info(`User ${socket.userId} disconnected from WebSocket`);
    });
  });

  return io;
}

// WebSocket event emitters
export class WebSocketService {
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
  }

  emitTransactionUpdate(userId: string, transaction: any) {
    this.io.to(`transactions:${userId}`).emit('transaction_update', {
      type: 'transaction_update',
      data: transaction
    });
  }

  emitPriceUpdate(tokenAddress: string, priceData: any) {
    this.io.to(`price:${tokenAddress}`).emit('price_update', {
      type: 'price_update',
      token: tokenAddress,
      data: priceData
    });
  }

  emitNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', {
      type: 'notification',
      data: notification
    });
  }

  broadcastSystemMessage(message: string) {
    this.io.emit('system_message', {
      type: 'system_message',
      message,
      timestamp: new Date().toISOString()
    });
  }
}