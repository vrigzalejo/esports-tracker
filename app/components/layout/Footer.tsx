

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-4 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center space-y-2">
                    {/* Copyright */}
                    <div className="text-xs text-gray-500">
                        © 2025 EsportsTracker. All rights reserved.
                    </div>
                    
                    {/* Mobile/Tablet: Stack vertically */}
                    <div className="flex flex-col items-center gap-3 text-xs lg:hidden">
                        <div className="text-center text-gray-500">
                            Made with ❤️ by{' '}
                            <a 
                                href="https://www.brigidoalejo.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                Brigido Alejo
                            </a>
                        </div>
                        <div className="text-center">
                            <a 
                                href="/privacy" 
                                className="text-gray-500 hover:text-gray-400 transition-colors duration-200"
                            >
                                Privacy
                            </a>
                        </div>
                        <div className="text-center">
                            <a 
                                href="https://coff.ee/brigsalejoq" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-3 py-1.5 rounded-full transition-colors duration-200 text-xs shadow-sm hover:shadow-md"
                            >
                                ☕ Buy me a coffee
                            </a>
                        </div>
                    </div>

                    {/* Desktop: Single line */}
                    <div className="hidden lg:flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>Made with ❤️ by</span>
                            <a 
                                href="https://www.brigidoalejo.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                Brigido Alejo
                            </a>
                            <span className="text-gray-700">•</span>
                            <a 
                                href="/privacy" 
                                className="text-gray-500 hover:text-gray-400 transition-colors duration-200"
                            >
                                Privacy
                            </a>
                        </div>
                        
                        <a 
                            href="https://coff.ee/brigsalejoq" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-3 py-1.5 rounded-full transition-colors duration-200 text-xs shadow-sm hover:shadow-md"
                        >
                            ☕ Buy me a coffee
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
} 
