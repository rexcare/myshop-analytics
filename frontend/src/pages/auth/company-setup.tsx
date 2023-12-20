import React, { useState, useEffect } from 'react';
// Chakra imports
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Icon,
	Input,
	InputGroup,
	InputRightElement,
	Text,
	useColorModeValue
} from '@chakra-ui/react';
// Custom components
import DefaultAuthLayout from 'layouts/auth/Default';
import { db } from 'firebaseConfig';
import { doc, collection, writeBatch } from "firebase/firestore"; 
import { useAuth } from 'contexts/AuthUserContext';
import { useRouter } from 'next/router';


export default function CompanySetup() {
	// Chakra color mode
	const textColor = useColorModeValue('navy.700', 'white');
	const textColorSecondary = 'gray.400';
	const brandStars = useColorModeValue('brand.500', 'brand.400');
	const [shopifyStore, setShopifyStore] = useState('');

	const { authUser: user, signOut, refetchCompany } = useAuth();
	const router = useRouter();
	const handleCompanyCreate = async (storeName: string, token: string) => {
		try {
			const companyId = storeName.replace(".myshopify.com", "");
			const batch = writeBatch(db);
			const companyRef = doc(db, "company", companyId);
			batch.set(companyRef, { 
				adminUid: user.uid, 
				shopifyIntegration: { storeName, token } 
			});

			const userRef = doc(collection(db, "company", companyId, "user"), user.uid);
			
			batch.set(userRef, { 
				displayName: user.displayName, 
				email: user.email,
				uid: user.uid,
			});
			// Commit the batch
			await batch.commit();
			refetchCompany(user.uid);
			router.push('/admin/default');
		} catch (e) {
			if (String(e).includes("Missing or insufficient permissions")) {
				window.alert(`Looks like some one else at ${storeName} has already created an account with us. At this time, we only support one account per Shopify store.`);
			} else {
				window.alert(e)
			}
		}
	};

	const access_token = router.query?.access_token as string;
	const shop = router.query?.shop as string;
	useEffect(() => {
		if (!!user && !!access_token && !!shop) {
			handleCompanyCreate(shop, access_token);
		}
	}, [user, access_token, shop])

	const onSignInClick = () => {
		const cleanName = shopifyStore.replace(".myshopify.com", "")
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/shopify/login?shop_name=${cleanName}&create_account=True`;
	};



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
						Company set up
					</Heading>
					<Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
						Welcome {user?.email || user?.displayName} !
					</Text>
					<Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md' w='480px'>
						Looks like it is your first time here. Lets link your Shopify store to get started
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
							Shopify store name<Text color={brandStars}>*</Text>
						</FormLabel>
						<InputGroup size='md'>
							<Input
								value={shopifyStore || ""}
								onChange={(e) => setShopifyStore(e.target.value)}	
								isRequired={true}
								fontSize='sm'
								placeholder='do not include `myshopify.com`'
								mb='24px'
								size='lg'
								variant='auth'
							/>
						</InputGroup>
						<Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' onClick={onSignInClick}>
							Link account
						</Button>
						<Button fontSize='sm' variant='solid' fontWeight='500' w='100%' h='50' mb='24px' onClick={signOut}>
							Sign out
						</Button>
					</FormControl>
				</Flex>
			</Flex>
		</DefaultAuthLayout>
	);
}