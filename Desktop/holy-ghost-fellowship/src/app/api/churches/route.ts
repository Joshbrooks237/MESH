import { NextRequest, NextResponse } from 'next/server'

// Mock church data - in a real app, this would come from a database
const mockChurches = [
  {
    id: "1",
    name: "Grace Community Church",
    denomination: "Baptist",
    address: "123 Main Street, Anytown, USA 12345",
    phone: "(555) 123-4567",
    website: "https://gracechurch.org",
    serviceTimes: ["Sunday 9:00 AM", "Sunday 11:00 AM", "Wednesday 7:00 PM"],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    rating: 4.8,
    reviewCount: 12,
    description: "A welcoming community focused on biblical teaching and fellowship."
  },
  {
    id: "2",
    name: "Holy Spirit Cathedral",
    denomination: "Catholic",
    address: "456 Oak Avenue, Anytown, USA 12345",
    phone: "(555) 987-6543",
    website: "https://holyspiritcathedral.org",
    serviceTimes: ["Saturday 5:00 PM", "Sunday 8:00 AM", "Sunday 10:00 AM", "Sunday 12:00 PM"],
    coordinates: { lat: 40.7589, lng: -73.9851 },
    rating: 4.6,
    reviewCount: 8,
    description: "A beautiful cathedral serving the Catholic community for over 100 years."
  },
  {
    id: "3",
    name: "Pentecostal Fire Church",
    denomination: "Pentecostal",
    address: "789 Flame Road, Anytown, USA 12345",
    phone: "(555) 456-7890",
    website: "https://pentecostalfire.org",
    serviceTimes: ["Sunday 10:00 AM", "Sunday 6:00 PM", "Tuesday 7:30 PM", "Thursday 7:30 PM"],
    coordinates: { lat: 40.7505, lng: -73.9934 },
    rating: 4.9,
    reviewCount: 15,
    description: "Experience the power of the Holy Spirit in worship and ministry."
  },
  {
    id: "4",
    name: "Calvary Methodist Church",
    denomination: "Methodist",
    address: "321 Hope Street, Anytown, USA 12345",
    phone: "(555) 321-0987",
    website: "https://calvarymethodist.org",
    serviceTimes: ["Sunday 8:30 AM", "Sunday 11:00 AM", "Sunday 6:00 PM"],
    coordinates: { lat: 40.7282, lng: -73.7949 },
    rating: 4.7,
    reviewCount: 10,
    description: "A warm Methodist congregation committed to community service."
  },
  {
    id: "5",
    name: "Lutheran Grace Church",
    denomination: "Lutheran",
    address: "654 Faith Avenue, Anytown, USA 12345",
    phone: "(555) 654-3210",
    website: "https://lutherangrace.org",
    serviceTimes: ["Sunday 9:00 AM", "Sunday 11:00 AM"],
    coordinates: { lat: 40.7580, lng: -73.9855 },
    rating: 4.5,
    reviewCount: 6,
    description: "Traditional Lutheran worship with contemporary outreach."
  }
]

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const denomination = searchParams.get('denomination') || 'All Denominations'
    const radius = parseFloat(searchParams.get('radius') || '10')
    const searchQuery = searchParams.get('q')

    let churches = [...mockChurches]

    // Filter by denomination if specified
    if (denomination && denomination !== 'All Denominations') {
      churches = churches.filter(church =>
        church.denomination.toLowerCase() === denomination.toLowerCase()
      )
    }

    // Filter by search query if provided
    if (searchQuery) {
      churches = churches.filter(church =>
        church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.denomination.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Calculate distances and filter by radius if location provided
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)

      churches = churches.map(church => ({
        ...church,
        distance: calculateDistance(userLat, userLng, church.coordinates.lat, church.coordinates.lng)
      })).filter(church => church.distance! <= radius)
         .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return NextResponse.json({
      success: true,
      churches,
      totalCount: churches.length,
      filters: {
        denomination: denomination || 'All Denominations',
        radius,
        userLocation: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
      }
    })

  } catch (error) {
    console.error('Error fetching churches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch churches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real app, this would add a new church to the database
    const body = await request.json()

    // Validate required fields
    const { name, denomination, address, coordinates } = body

    if (!name || !denomination || !address || !coordinates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock response - in real app, save to database
    const newChurch = {
      id: Date.now().toString(),
      ...body,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      church: newChurch,
      message: 'Church added successfully'
    })

  } catch (error) {
    console.error('Error adding church:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add church' },
      { status: 500 }
    )
  }
}
