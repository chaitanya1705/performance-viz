import { NextRequest } from 'next/server'
import { generateTimeSeriesData } from '@/lib/dataGenerator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const count = parseInt(searchParams.get('count') || '1000', 10)
  const startTime = parseInt(searchParams.get('startTime') || Date.now().toString(), 10)

  const data = generateTimeSeriesData(count, startTime, 100)

  return Response.json({
    data,
    timestamp: Date.now(),
    count: data.length,
  })
}

