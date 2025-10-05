import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex justify-between items-center px-8 py-4">
      <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">
        Study Buddy
      </Link>
      <ul className="flex space-x-6 text-black font-medium">
        <li>
          <Link to="/setup" className="hover:text-gray-700 transition-colors">
            Setup
          </Link>
        </li>
        <li>
          <Link to="/personalities" className="hover:text-gray-700 transition-colors">
            Chat
          </Link>
        </li>
      </ul>
    </nav>
  );
}