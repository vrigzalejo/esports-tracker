

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-4 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center space-y-3">
                    {/* Copyright */}
                    <div className="text-xs text-gray-500">
                        © {new Date().getFullYear()} EsportsTracker. All rights reserved.
                    </div>
                    
                    {/* Links and Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
                        <div className="flex items-center gap-4">
                            <a 
                                href="https://www.brigidoalejo.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                Made by Brigido Alejo
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
