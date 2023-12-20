// Chakra imports
import { Flex, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link'

// Custom components
import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
	//   Chakra color mode
	let logoColor = useColorModeValue('navy.700', 'white');

	return (
		<Flex alignItems='center' flexDirection='column'>
			<Link href={{ pathname: '/' }}>
				Clear Analytics
			</Link>
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
