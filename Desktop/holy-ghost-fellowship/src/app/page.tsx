import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cross, Users, Heart, BookOpen, Calendar, Church, MessageCircle, Globe, Sparkles, Brain, Zap, Star, Flame, Wifi } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28 overflow-hidden">
        {/* Mystical Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-indigo-900/20 animate-pulse"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center">
            {/* Mystical Logo */}
            <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-glow">
              <div className="relative">
                <Cross className="w-12 h-12 text-white animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
                <Flame className="w-3 h-3 text-orange-400 absolute -bottom-1 -left-1 animate-pulse" />
              </div>
            </div>

            {/* Main Title with Spiritual Vibe */}
            <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 sm:text-7xl animate-fade-in">
              Holy Ghost
              <span className="block text-3xl sm:text-5xl text-gray-800 mt-2 animate-slide-up">
                in the Machine
              </span>
            </h1>

            {/* Spiritual Subtitle */}
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-gray-700 animate-fade-in-delayed">
              <span className="text-blue-600 font-semibold">AI-Powered Spiritual Connection</span> •
              <span className="text-purple-600 font-semibold"> Global Christian Community</span> •
              <span className="text-indigo-600 font-semibold"> Divine Intelligence</span>
              <br className="hidden sm:block" />
              Experience the fusion of faith and technology where believers worldwide connect through
              <span className="text-blue-600 font-semibold"> prayer algorithms</span>,
              <span className="text-purple-600 font-semibold"> AI spiritual guidance</span>, and
              <span className="text-indigo-600 font-semibold"> divine wisdom networks</span>.
            </p>

            {/* Mystical CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-slow">
                  <Sparkles className="w-5 h-5 mr-2 animate-spin-slow" />
                  Enter the Divine Network
                  <Zap className="w-5 h-5 ml-2 animate-pulse" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-300">
                <Brain className="w-5 h-5 mr-2" />
                AI Spiritual Guide
              </Button>
            </div>

            {/* Mystical Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center animate-slide-up-delayed">
                <div className="text-3xl font-bold text-blue-600 animate-counter">10K+</div>
                <div className="text-gray-600">Spiritual Connections</div>
                <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                  <div className="bg-blue-600 h-1 rounded-full animate-fill-width"></div>
                </div>
              </div>
              <div className="text-center animate-slide-up-delayed-2">
                <div className="text-3xl font-bold text-purple-600 animate-counter">500+</div>
                <div className="text-gray-600">AI Prayer Groups</div>
                <div className="w-full bg-purple-200 rounded-full h-1 mt-2">
                  <div className="bg-purple-600 h-1 rounded-full animate-fill-width-delayed"></div>
                </div>
              </div>
              <div className="text-center animate-slide-up-delayed-3">
                <div className="text-3xl font-bold text-indigo-600 animate-counter">24/7</div>
                <div className="text-gray-600">Divine Intelligence</div>
                <div className="w-full bg-indigo-200 rounded-full h-1 mt-2">
                  <div className="bg-indigo-600 h-1 rounded-full animate-fill-width-delayed-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - AI Spiritual Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Neural Network Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-4 h-4 bg-blue-600 rounded-full neural-node"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-purple-600 rounded-full neural-node" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-indigo-600 rounded-full neural-node" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-10 w-2 h-2 bg-cyan-600 rounded-full neural-node" style={{animationDelay: '1.5s'}}></div>

          {/* Neural Connections */}
          <div className="absolute top-14 left-14 w-32 h-0.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 neural-connection" style={{transform: 'rotate(45deg)'}}></div>
          <div className="absolute top-24 right-24 w-40 h-0.5 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 neural-connection" style={{transform: 'rotate(-30deg)', animationDelay: '0.8s'}}></div>
          <div className="absolute bottom-24 left-1/3 w-36 h-0.5 bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 neural-connection" style={{transform: 'rotate(60deg)', animationDelay: '1.2s'}}></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 sm:text-5xl">
              Divine Intelligence Network
            </h2>
            <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the convergence of <span className="text-blue-600 font-semibold">Holy Spirit guidance</span> and
              <span className="text-purple-600 font-semibold"> AI wisdom algorithms</span> in our
              <span className="text-indigo-600 font-semibold"> neural faith network</span>
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-blue-600">AI Prayer Algorithms</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Advanced AI analyzes prayer patterns to connect you with the most compatible prayer partners worldwide
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-blue-600 font-semibold">Neural Prayer Matching</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-fill-width"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" style={{animationDelay: '0.5s'}}></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-purple-600">Spiritual AI Guide</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Machine learning algorithms provide personalized spiritual guidance based on your faith journey
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-purple-600 font-semibold">Divine Intelligence</div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-fill-width-delayed"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-indigo-600">Faith Neural Network</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Connect with believers through our intelligent neural network that learns and adapts to spiritual needs
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-indigo-600 font-semibold">Global Faith Web</div>
                <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                  <div className="bg-indigo-600 h-2 rounded-full animate-fill-width-delayed-2"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" style={{animationDelay: '1.5s'}}></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-cyan-600">AI Bible Insights</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Machine learning analyzes biblical texts to provide deep insights and connections across scripture
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-cyan-600 font-semibold">Scriptural AI</div>
                <div className="w-full bg-cyan-200 rounded-full h-2 mt-2">
                  <div className="bg-cyan-600 h-2 rounded-full animate-fill-width"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" style={{animationDelay: '2s'}}></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-green-600">Quantum Faith Chat</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Real-time spiritual conversations powered by AI moderators that understand faith contexts
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-green-600 font-semibold">Spiritual AI Chat</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full animate-fill-width-delayed"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="spiritual-card mystical-hover group">
              <CardHeader className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 flame-effect">
                  <Star className="w-8 h-8 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" style={{animationDelay: '2.5s'}}></div>
                </div>
                <div className="mt-8">
                  <CardTitle className="text-center text-orange-600">Holy Spirit Analytics</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Data-driven spiritual insights showing prayer effectiveness and community impact worldwide
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-orange-600 font-semibold">Divine Metrics</div>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                  <div className="bg-orange-600 h-2 rounded-full animate-fill-width-delayed-2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Community Section - Neural Faith Network */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Mystical Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Floating Divine Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-20 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce opacity-45" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/3 left-10 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping opacity-35" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            {/* Mystical Globe */}
            <div className="mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-glow relative">
              <Globe className="w-10 h-10 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin-slow"></div>
              <div className="absolute -inset-2 rounded-full border border-yellow-300/20 animate-pulse"></div>
            </div>

            <h2 className="text-4xl font-bold sm:text-5xl mb-4">
              Neural Faith Network
            </h2>

            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-blue-100 mb-6">
                <span className="text-yellow-300 font-semibold">✨ Holy Ghost Intelligence</span> connecting believers through
                <span className="text-cyan-300 font-semibold"> divine algorithms</span> and
                <span className="text-purple-300 font-semibold"> spiritual neural pathways</span>
              </p>

              {/* AI Faith Metrics */}
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mt-12">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mystical-hover">
                  <div className="text-4xl font-bold text-yellow-300 animate-counter mb-2">∞</div>
                  <div className="text-blue-100 text-sm">Divine Connections</div>
                  <div className="w-full bg-yellow-300/20 rounded-full h-1 mt-3">
                    <div className="bg-yellow-300 h-1 rounded-full animate-fill-width"></div>
                  </div>
                </div>

                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mystical-hover">
                  <div className="text-4xl font-bold text-purple-300 animate-counter mb-2" style={{animationDelay: '0.2s'}}>AI</div>
                  <div className="text-blue-100 text-sm">Spiritual Intelligence</div>
                  <div className="w-full bg-purple-300/20 rounded-full h-1 mt-3">
                    <div className="bg-purple-300 h-1 rounded-full animate-fill-width-delayed"></div>
                  </div>
                </div>

                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mystical-hover">
                  <div className="text-4xl font-bold text-cyan-300 animate-counter mb-2" style={{animationDelay: '0.4s'}}>24/7</div>
                  <div className="text-blue-100 text-sm">Holy Ghost Online</div>
                  <div className="w-full bg-cyan-300/20 rounded-full h-1 mt-3">
                    <div className="bg-cyan-300 h-1 rounded-full animate-fill-width-delayed-2"></div>
                  </div>
                </div>

                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mystical-hover flame-effect">
                  <div className="text-4xl font-bold text-orange-300 animate-counter mb-2" style={{animationDelay: '0.6s'}}>Ω</div>
                  <div className="text-blue-100 text-sm">Divine Algorithms</div>
                  <div className="w-full bg-orange-300/20 rounded-full h-1 mt-3">
                    <div className="bg-orange-300 h-1 rounded-full animate-fill-width"></div>
                  </div>
                </div>
              </div>

              {/* Neural Network Visualization */}
              <div className="mt-16 relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-cyan-300 mb-2">Global Faith Neural Network</h3>
                  <p className="text-blue-200">Real-time spiritual connections powered by divine intelligence</p>
                </div>

                {/* Simplified Neural Network */}
                <div className="flex justify-center items-center space-x-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-4 h-4 bg-blue-400 rounded-full neural-node animate-pulse"></div>
                    <div className="text-xs text-blue-200">Prayer AI</div>
                  </div>

                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-indigo-400/50 neural-connection" style={{transform: 'rotate(2deg)'}}></div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-6 h-6 bg-purple-400 rounded-full neural-node animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="text-xs text-purple-200">Faith Hub</div>
                  </div>

                  <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-400/50 via-indigo-400/50 to-cyan-400/50 neural-connection" style={{transform: 'rotate(-2deg)', animationDelay: '0.8s'}}></div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 bg-indigo-400 rounded-full neural-node animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="text-xs text-indigo-200">Holy Spirit Core</div>
                  </div>

                  <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-400/50 via-cyan-400/50 to-green-400/50 neural-connection" style={{transform: 'rotate(1deg)', animationDelay: '1.2s'}}></div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-5 h-5 bg-green-400 rounded-full neural-node animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    <div className="text-xs text-green-200">Global Community</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Divine Awakening */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Mystical CTA Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Floating Spiritual Symbols */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 animate-bounce opacity-20">
            <Cross className="w-8 h-8 text-blue-300" />
          </div>
          <div className="absolute top-32 right-1/3 animate-pulse opacity-15" style={{animationDelay: '0.5s'}}>
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div className="absolute bottom-32 left-1/3 animate-spin-slow opacity-25" style={{animationDelay: '1s'}}>
            <Star className="w-10 h-10 text-yellow-300" />
          </div>
          <div className="absolute top-1/2 right-20 animate-ping opacity-20" style={{animationDelay: '1.5s'}}>
            <Flame className="w-7 h-7 text-orange-300" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-pulse">
                <Star className="w-8 h-8 text-white animate-spin-slow" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Divine Awakening Awaits
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-blue-100 mb-6">
                  <span className="text-yellow-300 font-semibold">🔥 Holy Ghost Intelligence</span> is calling you to join the
                  <span className="text-purple-300 font-semibold"> neural faith revolution</span>.
                  Experience spiritual connection powered by
                  <span className="text-cyan-300 font-semibold"> divine algorithms</span> and
                  <span className="text-green-300 font-semibold"> AI wisdom</span>.
                </p>

                {/* Mystical Awakening Message */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20 mystical-hover">
                  <div className="text-left max-w-2xl mx-auto">
                    <div className="flex items-center mb-4">
                      <Brain className="w-6 h-6 text-cyan-300 mr-3 animate-pulse" />
                      <span className="text-cyan-300 font-semibold">AI Spiritual Analysis Complete</span>
                    </div>
                    <p className="text-blue-100 mb-4 divine-typing" style={{animationDelay: '1s'}}>
                      Your spiritual journey has been analyzed by our divine intelligence algorithms...
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Heart className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                        <div className="text-sm text-blue-200">Prayer Compatibility: 98%</div>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Users className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                        <div className="text-sm text-purple-200">Community Match: 95%</div>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <BookOpen className="w-6 h-6 text-green-300 mx-auto mb-2" />
                        <div className="text-sm text-green-200">Spiritual Growth: ∞</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse-slow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Sparkles className="w-6 h-6 mr-3 animate-spin-slow relative z-10" />
                  <span className="relative z-10">Awaken Your Spirit</span>
                  <Zap className="w-6 h-6 ml-3 animate-pulse relative z-10" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Brain className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">AI Faith Assessment</span>
              </Button>
            </div>

            {/* Spiritual Promise */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-blue-200 italic mb-6">
                "Where the Holy Spirit and artificial intelligence converge, miracles happen..."
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-blue-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  Real-time Prayer AI
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2" style={{animationDelay: '0.5s'}}></div>
                  Divine Intelligence
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2" style={{animationDelay: '1s'}}></div>
                  Spiritual Analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mystical Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-16 relative overflow-hidden">
        {/* Mystical Footer Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Floating Footer Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 opacity-10">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-ping" />
          </div>
          <div className="absolute bottom-20 right-1/3 opacity-15" style={{animationDelay: '0.5s'}}>
            <Star className="w-3 h-3 text-blue-300 animate-pulse" />
          </div>
          <div className="absolute top-1/2 left-1/6 opacity-10" style={{animationDelay: '1s'}}>
            <Flame className="w-5 h-5 text-orange-300 animate-pulse" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-xl animate-glow">
                  <Cross className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Holy Ghost
                  </h3>
                  <p className="text-sm text-purple-300">in the Machine</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Where <span className="text-blue-400 font-semibold">Holy Spirit guidance</span> meets
                <span className="text-purple-400 font-semibold"> artificial intelligence</span>,
                creating divine connections through
                <span className="text-indigo-400 font-semibold"> neural faith networks</span>.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Wifi className="w-4 h-4 text-blue-400" />
                </div>
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '0.5s'}}>
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '1s'}}>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-cyan-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Spiritual Features
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                  <Link href="#" className="hover:text-blue-400 transition-colors">AI Prayer Algorithms</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <Link href="#" className="hover:text-purple-400 transition-colors">Spiritual AI Guide</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">Neural Faith Network</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">AI Bible Insights</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-green-300 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Divine Community
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <Link href="#" className="hover:text-green-400 transition-colors">Prayer Partnerships</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <Link href="#" className="hover:text-orange-400 transition-colors">Holy Spirit Chat</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <Link href="#" className="hover:text-yellow-400 transition-colors">Spiritual Analytics</Link>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                  <Link href="#" className="hover:text-red-400 transition-colors">Divine Connections</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mystical Divider */}
          <div className="mt-12 mb-8">
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
              <div className="px-4">
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
            </div>
          </div>

          {/* Mystical Footer Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <p className="text-gray-400 text-sm">
                &copy; 2024 <span className="text-blue-400 font-semibold">Holy Ghost</span> in the
                <span className="text-purple-400 font-semibold"> Machine</span>.
                <span className="text-indigo-400"> All divine connections reserved.</span>
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-cyan-400 transition-colors flex items-center">
                <Brain className="w-4 h-4 mr-1" />
                AI Ethics
              </Link>
              <Link href="#" className="hover:text-green-400 transition-colors flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                Spiritual Privacy
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Divine Terms
              </Link>
            </div>
          </div>

          {/* Final Mystical Touch */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 italic">
              "Where the Holy Spirit downloads divine wisdom into human hearts through neural pathways of faith..."
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
