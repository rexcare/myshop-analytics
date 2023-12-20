import { Icon } from '@chakra-ui/react'
import {
  MdHome,
} from 'react-icons/md'

// Admin Imports
import AdminDefault from 'pages/admin/default'
import AdminDashboard from 'pages/admin/dashboard'

import { IRoute } from 'types/navigation'

const routes: IRoute[] = [
  {
    name: 'Quick insights',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: AdminDefault
  },
  {
    name: 'Home',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: AdminDashboard
  }
]

export default routes
