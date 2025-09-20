import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cross, Users, Heart, BookOpen, Calendar, Church, MessageCircle, Globe } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto mb-8 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Cross className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Holy Ghost Fellowship
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Connect with Christians worldwide for prayer, fellowship, Bible study, and spiritual growth.
              Join our global community of believers united in faith and love.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Join Our Community
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Connect in Faith
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover the ways our platform brings Christians together across the globe
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Prayer Requests</CardTitle>
                <CardDescription>
                  Share your prayer needs and find prayer partners from around the world
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Fellowship Groups</CardTitle>
                <CardDescription>
                  Join small groups, Bible study circles, and ministry teams in your area or online
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Bible Study</CardTitle>
                <CardDescription>
                  Access daily devotionals, study guides, and connect with study groups
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Connect instantly with believers through group chats and direct messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Virtual Events</CardTitle>
                <CardDescription>
                  Join prayer meetings, worship sessions, and fellowship events from anywhere
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Church className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Church Directory</CardTitle>
                <CardDescription>
                  Find churches, view service times, and connect with local congregations worldwide
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Community Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="mx-auto mb-8 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              One Global Family
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Christians from every nation, tribe, and tongue united in Christ
            </p>
            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-blue-100">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-100">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-100">Groups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-100">Prayer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Connect?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of believers who are already part of our growing community
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center mb-4">
                <Cross className="w-6 h-6 mr-2" />
                <span className="font-bold text-lg">Holy Ghost Fellowship</span>
              </div>
              <p className="text-gray-400">
                Connecting Christians worldwide for fellowship, prayer, and spiritual growth.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Prayer Requests</Link></li>
                <li><Link href="#" className="hover:text-white">Bible Study</Link></li>
                <li><Link href="#" className="hover:text-white">Fellowship Groups</Link></li>
                <li><Link href="#" className="hover:text-white">Virtual Events</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Church Directory</Link></li>
                <li><Link href="#" className="hover:text-white">Mission Support</Link></li>
                <li><Link href="#" className="hover:text-white">Testimonials</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Holy Ghost Fellowship. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
