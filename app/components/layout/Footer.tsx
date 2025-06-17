import { Heart, Coffee } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-4 sm:py-6 border-t border-gray-800 mt-auto">
            <div className="container-responsive">
                <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-4 text-gray-400 text-xs sm:text-sm">
                    {/* Left column - empty on larger screens, but could contain other content */}
                    <div className="hidden sm:block"></div>
                    
                    {/* Center column - "Made with by..." text */}
                    <div className="flex items-center justify-center text-center">
                        <span>Made with</span>
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 mx-1 text-red-500 fill-red-500" />
                        <span>by</span>
                        <a 
                            href="https://www.brigidoalejo.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-400 hover:text-blue-300 transition-colors duration-200 cursor-pointer min-h-[44px] flex items-center"
                        >
                            Brigido Alejo
                        </a>
                    </div>
                    
                    {/* Right column - Coffee button */}
                    <div className="flex items-center justify-center sm:justify-end">
                        <a 
                            href="https://coff.ee/brigsalejoq" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 sm:gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 bg-yellow-400/10 hover:bg-yellow-400/20 px-3 py-2 rounded-full border border-yellow-400/20 cursor-pointer min-h-[44px] text-xs sm:text-sm"
                        >
                            <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Buy me a coffee</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
} 
