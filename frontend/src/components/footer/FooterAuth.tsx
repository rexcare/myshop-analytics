/* eslint-disable */

import { Flex, Link, List, ListItem, Text, useColorModeValue } from '@chakra-ui/react';

export default function Footer(props: { [x: string]: any }) {
	let textColor = useColorModeValue('gray.400', 'white');
	let linkColor = useColorModeValue({ base: 'gray.400', lg: 'white' }, 'white');
	return (
		<Flex
			zIndex='3'
			flexDirection={{
				base: 'column',
				lg: 'row'
			}}
			alignItems={{
				base: 'center',
				xl: 'start'
			}}
			justifyContent='space-between'
			px={{ base: '30px', md: '0px' }}
			pb='30px'
			{...props}>
			<Text
				color={textColor}
				textAlign={{
					base: 'center',
					xl: 'start'
				}}
				mb={{ base: '20px', lg: '0px' }}>
				{' '}
				&copy; {new Date().getFullYear()}
				<Text as='span' fontWeight='500' ms='4px'>
					Clear Analytics. All Rights Reserved.
				</Text>
			</Text>
			<List display='flex'>
				<ListItem>
					<Link fontWeight='500' color={linkColor} href='https://www.clear-analytics.com/'>
						About us
					</Link>
				</ListItem>
			</List>
		</Flex>
	);
}
