
// React import not required with the new JSX transform
import {Link} from 'react-router-dom'
import {LuBox, LuShoppingBag} from "react-icons/lu";
import { FaPeopleGroup } from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import { BsBoxSeam } from "react-icons/bs";


const Menu = () => {

  const LINKS_SIDEBAR = [
    {id:1, path:'/', name:'Dashboard', icon:LuBox},
    {id:2, path:'/Clientes', name:'Clientes', icon:FaPeopleGroup},
    {id:1, path:'/Categorias', name:'Categorias', icon:BiSolidCategory},
    {id:1, path:'/Producto', name:'Producto', icon:BsBoxSeam},
    {id:1, path:'/MostrarVentas', name:'Ventas', icon:LuShoppingBag},
  ]

  return (

    <ul className=''>
        {
          LINKS_SIDEBAR.map((link, index)=>(
            <li key={index} className={` rounded-md p-4 hover:bg-gray-100 hover:text-indigo-500`}>
              <Link to={link.path} className='flex items-center '>
                <span className=''>{link.icon()}</span>
                <span className='text-lg text-gray-500 px-4'>{link.name}</span>
              </Link>
            </li>
          ))
        }
    </ul>

  )
}

export default Menu;
