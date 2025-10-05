import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let hideTimeout = null;

    const onMouseMove = (e) => {
      // show when mouse is near top of the window
      if (e.clientY <= 30) {
        setVisible(true);
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        return;
      }

      // hide after a brief delay when mouse moves away
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setVisible(false), 300); // 300ms hide delay
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <nav
      className={
        "fixed top-0 left-0 w-full bg-white shadow-md z-50 flex justify-between items-center px-8 py-4 transform transition-transform duration-200 ease-out " +
        (visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0")
      }
      aria-hidden={!visible}
    >
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