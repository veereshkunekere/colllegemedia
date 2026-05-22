// New Topbar.jsx (X-like top search bar)
import SearchIcon from '@mui/icons-material/Search';

function Topbar() {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-center px-4 py-2 bg-black border-b border-gray-800">
            <div className="flex items-center gap-2 w-full max-w-md">
                <div className="flex items-center gap-2 flex-1 bg-gray-900 rounded-full px-3 py-2">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent outline-none text-white placeholder-gray-500 w-full text-sm"
                    />
                </div>
            </div>
        </header>
    );
}

export default Topbar;