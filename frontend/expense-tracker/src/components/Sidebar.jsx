import { Link } from 'react-router-dom';

const Sidebar = () => {

  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Sidebar</h1>
      </div>
      <ul className="mt-4">
        <Link to="/transaction"><li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Transactions</li></Link>
      </ul>
    </div>
  );
};

export default Sidebar;