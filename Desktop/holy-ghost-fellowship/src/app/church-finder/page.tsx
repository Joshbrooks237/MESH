"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Phone,
  Globe,
  Clock,
  Star,
  Heart,
  Users,
  Church,
  Sparkles,
  Cross,
  Zap,
  Flame
} from "lucide-react"
import { Loader } from "@googlemaps/js-api-loader"

interface Church {
  id: string
  name: string
  denomination: string
  address: string
  phone?: string
  website?: string
  serviceTimes: string[]
  coordinates: {
    lat: number
    lng: number
  }
  distance?: number
  rating?: number
  reviewCount?: number
  description?: string
}

const denominations = [
  "All Denominations",
  "Baptist",
  "Catholic",
  "Pentecostal",
  "Methodist",
  "Lutheran",
  "Presbyterian",
  "Episcopal",
  "Non-Denominational",
  "Orthodox",
  "Anglican",
  "Assembly of God",
  "Church of Christ",
  "Seventh-day Adventist"
]

export default function ChurchFinder() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [churches, setChurches] = useState<Church[]>([])
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([])
  const [selectedDenomination, setSelectedDenomination] = useState("All Denominations")
  const [searchRadius, setSearchRadius] = useState(10)
  const [searchAddress, setSearchAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  // Mock church data (in a real app, this would come from an API)
  const mockChurches: Church[] = [
    {
      id: "1",
      name: "Grace Community Church",
      denomination: "Baptist",
      address: "123 Main Street, Anytown, USA",
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
      address: "456 Oak Avenue, Anytown, USA",
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
      address: "789 Flame Road, Anytown, USA",
      phone: "(555) 456-7890",
      website: "https://pentecostalfire.org",
      serviceTimes: ["Sunday 10:00 AM", "Sunday 6:00 PM", "Tuesday 7:30 PM", "Thursday 7:30 PM"],
      coordinates: { lat: 40.7505, lng: -73.9934 },
      rating: 4.9,
      reviewCount: 15,
      description: "Experience the power of the Holy Spirit in worship and ministry."
    }
  ]

  useEffect(() => {
    // Load Google Maps API
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"]
    })

    loader.load().then(() => {
      setMapLoaded(true)
    }).catch((error) => {
      console.error("Error loading Google Maps:", error)
    })
  }, [])

  useEffect(() => {
    // Filter churches based on denomination and calculate distances
    let filtered = churches

    if (selectedDenomination !== "All Denominations") {
      filtered = filtered.filter(church => church.denomination === selectedDenomination)
    }

    if (userLocation && searchRadius > 0) {
      filtered = filtered.filter(church => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          church.coordinates.lat,
          church.coordinates.lng
        )
        church.distance = distance
        return distance <= searchRadius
      })
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    setFilteredChurches(filtered)
  }, [churches, selectedDenomination, searchRadius, userLocation])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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

  const getUserLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setChurches(mockChurches) // In real app, fetch from API
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
          // Fallback to default location or ask for manual address
        }
      )
    }
  }

  const searchByAddress = () => {
    if (!searchAddress.trim()) return

    setIsLoading(true)
    // In a real app, you'd use Google Maps Geocoding API here
    // For demo purposes, we'll just use the mock data
    setChurches(mockChurches)
    setIsLoading(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <section className="relative px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16 overflow-hidden">
        {/* Mystical Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-indigo-900/10"></div>
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center">
            {/* Mystical Logo */}
            <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl animate-glow">
              <Church className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 sm:text-6xl">
              Find Your Church
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-700">
              Discover <span className="text-blue-600 font-semibold">Holy Spirit-led communities</span> near you.
              Connect with churches of all denominations and find your spiritual home.
            </p>
          </div>
        </div>
      </section>

      {/* Search Controls */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="spiritual-card mystical-hover">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Search className="w-5 h-5 mr-2" />
                Search for Churches
              </CardTitle>
              <CardDescription>
                Find churches near you by location and denomination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Location
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter your address"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={searchByAddress} variant="outline">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Use Your Location
                  </label>
                  <Button
                    onClick={getUserLocation}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {isLoading ? "Getting Location..." : "Use My Location"}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denomination
                  </label>
                  <select
                    value={selectedDenomination}
                    onChange={(e) => setSelectedDenomination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {denominations.map((denom) => (
                      <option key={denom} value={denom}>{denom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius
                  </label>
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={5}>5 miles</option>
                    <option value={10}>10 miles</option>
                    <option value={25}>25 miles</option>
                    <option value={50}>50 miles</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => setFilteredChurches(filteredChurches)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="spiritual-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    Church Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    ref={mapRef}
                    className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    {mapLoaded ? (
                      <div className="text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Interactive map would load here</p>
                        <p className="text-sm">Google Maps integration ready</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p>Loading map...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Church List */}
            <div>
              <Card className="spiritual-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Church className="w-5 h-5 mr-2" />
                    Nearby Churches
                    {filteredChurches.length > 0 && (
                      <span className="ml-auto text-sm text-gray-500">
                        {filteredChurches.length} found
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Finding churches...</p>
                    </div>
                  ) : filteredChurches.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredChurches.map((church) => (
                        <div
                          key={church.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow mystical-hover"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{church.name}</h3>
                            {church.distance && (
                              <span className="text-sm text-gray-500">
                                {church.distance.toFixed(1)} mi
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-purple-600 mb-2">{church.denomination}</p>
                          <p className="text-sm text-gray-600 mb-2">{church.address}</p>

                          {church.rating && (
                            <div className="flex items-center mb-2">
                              <div className="flex items-center mr-2">
                                {renderStars(church.rating)}
                              </div>
                              <span className="text-sm text-gray-600">
                                {church.rating} ({church.reviewCount} reviews)
                              </span>
                            </div>
                          )}

                          {church.serviceTimes.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-700 font-medium mb-1">Service Times:</p>
                              <div className="text-xs text-gray-600 space-y-1">
                                {church.serviceTimes.slice(0, 2).map((time, index) => (
                                  <div key={index} className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {time}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2 mt-3">
                            {church.phone && (
                              <Button size="sm" variant="outline" className="flex-1">
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            )}
                            {church.website && (
                              <Button size="sm" variant="outline" className="flex-1">
                                <Globe className="w-3 h-3 mr-1" />
                                Visit
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userLocation ? (
                    <div className="text-center py-8">
                      <Church className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No churches found in this area.</p>
                      <p className="text-sm text-gray-500 mt-2">Try expanding your search radius.</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Enter your location to find nearby churches.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
