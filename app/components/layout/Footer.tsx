import { Heart, Coffee } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-4 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
                    <div className="flex items-center">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 mx-1 text-red-500 fill-red-500" />
                        <span>by</span>
                        <a 
                            href="https://www.brigidoalejo.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                            Brigido Alejo
                        </a>
                    </div>
                    <div className="flex items-center">
                        <a 
                            href="https://coff.ee/brigsalejoq" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 bg-yellow-400/10 hover:bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/20"
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Buy me a coffee</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
} 
