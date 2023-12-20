/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useEffect, useState } from 'react';
// Chakra imports
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Text,
	useColorModeValue
} from '@chakra-ui/react';
import { useRouter } from 'next/router'
import DefaultAuthLayout from 'layouts/auth/Default';

export default function Demo() {
	// Chakra color mode
	const textColor = useColorModeValue('navy.700', 'white');
	const textColorSecondary = 'gray.400';
	const [shop, setShop] = useState("");

	const onSignInClick = (shopName: string) => {
		const cleanName = shopName.replace(".myshopify.com", "")
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/shopify/login?shop_name=${cleanName}`;
	};


	// Fetch data
	const router = useRouter();
	const access_token = router.query?.access_token;
	const shopName = router.query?.shop;
	useEffect(() => {
	if (shopName) {
		onSignInClick(shopName as string);
	}
	}, [shopName])
	
	return (
		<DefaultAuthLayout illustrationBackground={'/img/auth/analytics.jpeg'}>
			<Flex
				maxW={{ base: '100%', md: 'max-content' }}
				w='100%'
				mx={{ base: 'auto', lg: '0px' }}
				me='auto'
				h='100%'
				alignItems='start'
				justifyContent='center'
				mb={{ base: '30px', md: '60px' }}
				px={{ base: '25px', md: '0px' }}
				mt={{ base: '40px', md: '14vh' }}
				flexDirection='column'>
				<Box me='auto'>
					<Heading color={textColor} fontSize='36px' mb='10px'>
						Quick insights
					</Heading>
					<Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
						Enter your Shopify store name to gain insights into your sales
					</Text>
				</Box>
				<Flex
					zIndex='2'
					direction='column'
					w={{ base: '100%', md: '420px' }}
					maxW='100%'
					background='transparent'
					borderRadius='15px'
					mx={{ base: 'auto', lg: 'unset' }}
					me='auto'
					mb={{ base: '20px', md: 'auto' }}>
					
					
					<FormControl>
						<FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
							Store name
						</FormLabel>
						<Input
							isRequired={true}
							variant='auth'
							fontSize='sm'
							ms={{ base: '0px', md: '0px' }}
							value={shop}
							onChange={(e) => setShop(e.target.value)}
							placeholder='do not include `myshopify.com`'
							mb='24px'
							fontWeight='500'
							size='lg'
						/>
						<Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' onClick={() => onSignInClick(shop || "")}>
							Check it out
						</Button>
					</FormControl>
				</Flex>
			</Flex>
		</DefaultAuthLayout>
	);
}
