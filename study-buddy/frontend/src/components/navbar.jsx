import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex justify-between items-center px-8 py-4">
  <h1 className="text-2xl font-bold text-black">Study Buddy</h1>
  <ul className="flex space-x-6 text-black font-medium">
    <li>
      <Link to="/setup" className="hover:text-gray-700">
        Homepage
      </Link>
    </li>
    <li>Login</li>
  </ul>
</div>
  );
}
