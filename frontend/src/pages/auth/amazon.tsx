import React, { useState, useEffect } from 'react';
import Router from 'next/router';
// Chakra imports
import {
	Box,
	Button,
	Flex,
	Link,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Heading,
	Icon,
	Input,
	InputGroup,
	InputRightElement,
	Text,
	useColorModeValue
} from '@chakra-ui/react';
import { db } from 'firebaseConfig';
import { doc, collection, updateDoc } from "firebase/firestore"; 
import DefaultAuthLayout from 'layouts/auth/Default';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useAuth } from 'contexts/AuthUserContext';
import { useRouter } from 'next/router';


const AMAZON_APP_ID = "amzn1.sp.solution.5ccff65f-14d2-4768-8b61-c300f2c70c6a";
const AMAZON_APP_VERSION = "beta";
const AMAZON_REDIRECT_URL = "https://clearanalytics-dev.web.app/auth/amazon"
const AMAZON_URL = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${AMAZON_APP_ID}&state=astate&version=${AMAZON_APP_VERSION}&redirect_uri=${AMAZON_REDIRECT_URL}`;

const AMAZON_GET_TOKEN_URL = `https://sellercentral.amazon.com/sellingpartner/self-authorize/${AMAZON_APP_ID}`;

export function handleAmazonLinkAccount() {
	window.location.href = AMAZON_URL;
}

export default function AmazonLinkAccount() {
	// Chakra color mode
	const textColor = useColorModeValue('navy.700', 'white');
	const textColorBrand = useColorModeValue('brand.500', 'white');
	const brandStars = useColorModeValue('brand.500', 'brand.400');
	const [token, setToken] = useState('');

	const router = useRouter();
	const spapi_oauth_code = router.query?.spapi_oauth_code as string;
	const selling_partner_id = router.query?.selling_partner_id as string;
	const { authUser: user, company } = useAuth();

	const handleAmazonSaveToken = async () => {
		try {
			const companyRef = doc(db, "company", company?.firebaseId);
			const res = await updateDoc(companyRef, {
			  amazonIntegration: {
				spapi_oauth_code,
				selling_partner_id,
				refresh_token: token
			  }
			});
			console.log(res)
			router.push('/admin/default');
		} catch (e) {
			window.alert(e)
		}
	};

	if (spapi_oauth_code && selling_partner_id && company?.firebaseId) {
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
							Amazon account setup
						</Heading>

					</Box>
					<>
					<Text fontSize='20' width={600} marginTop={4}>
						One more step! Click on Get token to navigate to Amazon to generate an authorization token. Then, save it below.
					</Text>
					<Link target="_blank" href={AMAZON_GET_TOKEN_URL} rel="noopener noreferrer" variant="link"  marginTop={4}>
						<Text color={textColorBrand} as='span' fontSize='20' fontWeight='500'>
							Get token
						</Text>
					</Link>
					</>
					<FormControl style={{marginTop: 24}} isInvalid={!token?.startsWith("Atzr")}>
						<FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
							Authorization token<Text color={brandStars}>*</Text>
						</FormLabel>
						<Input
							isRequired={true}
							variant='auth'
							fontSize='sm'
							ms={{ base: '0px', md: '0px' }}
							value={token || ""}
        					onChange={(e) => setToken(e.target.value)}
							placeholder='Begins with Atzr|...'
							mb='24px'
							fontWeight='500'
							size='lg'
							isInvalid={!token?.startsWith("Atzr")}
						/>
						<FormErrorMessage>Token must begin with Atzr|</FormErrorMessage>
						<Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' onClick={handleAmazonSaveToken} marginTop={8}>
							Save token
						</Button>
					</FormControl>
				</Flex>
			</DefaultAuthLayout>
		);

	}

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
						Amazon account setup
					</Heading>
				</Box>
				<Button onClick={handleAmazonLinkAccount} variant="link">
					<a>
						<Text color={textColorBrand} as='span' ms='5px' fontWeight='500'>
							Link account
						</Text>
					</a>
				</Button>
			</Flex>
		</DefaultAuthLayout>
	);
}