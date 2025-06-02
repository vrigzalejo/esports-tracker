import { Heart } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-4 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center text-gray-400 text-sm">
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
            </div>
        </footer>
    )
} 