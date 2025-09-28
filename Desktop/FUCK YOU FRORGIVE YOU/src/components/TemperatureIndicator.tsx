interface TemperatureIndicatorProps {
  currentPage?: string;
  progress?: number; // 0-100
}

export default function TemperatureIndicator({ currentPage = 'home', progress = 0 }: TemperatureIndicatorProps) {
  const getTemperatureForPage = (page: string) => {
    const temperatures = {
      home: { temp: 'Hot 🔥', color: 'from-red-500 to-orange-500', description: 'Starting with anger & hurt' },
      exercises: { temp: 'Warm 🌡️', color: 'from-orange-500 to-yellow-500', description: 'Processing emotions' },
      stories: { temp: 'Temperate 🌤️', color: 'from-yellow-500 to-green-500', description: 'Finding understanding' },
      learn: { temp: 'Cool ❄️', color: 'from-green-500 to-blue-500', description: 'Gaining wisdom' },
      meditate: { temp: 'Cold 🧊', color: 'from-blue-500 to-purple-500', description: 'Achieving peace' }
    };
    return temperatures[page as keyof typeof temperatures] || temperatures.home;
  };

  const temp = getTemperatureForPage(currentPage);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${temp.color} animate-pulse`}></div>
          <span className="font-semibold text-gray-800">{temp.temp}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{temp.description}</p>

        {/* Progress bar for exercises/meditations */}
        {(currentPage === 'exercises' || currentPage === 'meditate') && progress > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${temp.color} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Temperature scale visualization */}
        <div className="mt-3 flex items-center space-x-1">
          <span className="text-xs text-red-500">🔴</span>
          <div className="flex-1 h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded"></div>
          <span className="text-xs text-purple-500">🟣</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Hot</span>
          <span>Cold</span>
        </div>
      </div>
    </div>
  );
}
