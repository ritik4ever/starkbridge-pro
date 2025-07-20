'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  isLoading?: boolean
  className?: string
}

export function StatsCard({ title, value, change, isLoading, className = '' }: StatsCardProps) {
  const isPositive = change.startsWith('+')
  const isNegative = change.startsWith('-')

  if (isLoading) {
    return (
      <div className={`bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/50 backdrop-blur-lg border border-border rounded-xl p-6 ${className}`}
    >
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
      }`}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        <span>{change}</span>
      </div>
    </motion.div>
  )
}