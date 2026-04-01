'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Mock historical data for the last 30 minutes
const generateHistory = () => {
  const data = []
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000)
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 20) + 15,
      rps: Math.floor(Math.random() * 100) + 200,
      latency: Math.floor(Math.random() * 10) + 12,
    })
  }
  return data
}

const HISTORY_DATA = generateHistory()

export default function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {/* CPU & RPS Load Chart */}
      <div className="surface-container p-8 rounded-2xl shadow-xl border border-outline/5 h-[400px]">
        <div className="flex flex-col mb-6">
          <h4 className="text-lg font-black font-manrope">Charge Serveur (30m)</h4>
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Évolution de la charge CPU & Requêtes/Sec</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORY_DATA}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#392cc1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#392cc1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4648d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4648d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                interval={5}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#121214', 
                  border: '1px solid rgba(199,196,216,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                }}
                itemStyle={{ fontSize: '10px' }}
                labelStyle={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#392cc1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCpu)" 
                name="CPU %"
              />
              <Area 
                type="monotone" 
                dataKey="rps" 
                stroke="#fe2c55" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRps)" 
                name="RPS (Req/s)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* API Latency Distribution */}
      <div className="surface-container p-8 rounded-2xl shadow-xl border border-outline/5 h-[400px]">
        <div className="flex flex-col mb-6">
          <h4 className="text-lg font-black font-manrope">Distribution de la Latence</h4>
          <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Temps de réponse moyen par endpoint (ms)</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ENDPOINT_LATENCY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#121214', 
                  border: '1px solid rgba(199,196,216,0.1)',
                  borderRadius: '12px' 
                }} 
              />
              <Bar dataKey="ms" radius={[4, 4, 0, 0]} name="Latence (ms)">
                {ENDPOINT_LATENCY.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.ms > 30 ? '#fe2c55' : entry.ms > 20 ? '#fbbf24' : '#392cc1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const ENDPOINT_LATENCY = [
  { name: 'Feed', ms: 12 },
  { name: 'Upload', ms: 45 },
  { name: 'Profile', ms: 18 },
  { name: 'Auth', ms: 32 },
  { name: 'Search', ms: 22 },
  { name: 'Likes', ms: 10 },
]
