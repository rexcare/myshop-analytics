import React, { useState } from 'react';
import Router from 'next/router';
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
import DefaultAuthLayout from 'layouts/auth/Default';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useAuth } from 'contexts/AuthUserContext';

export default function SignIn() {
	// Chakra color mode
	const textColor = useColorModeValue('navy.700', 'white');
	const textColorSecondary = 'gray.400';
	const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
	const textColorBrand = useColorModeValue('brand.500', 'white');
	const brandStars = useColorModeValue('brand.500', 'brand.400');
	const [isSignIn, setIsSignIn] = useState(true);
	const [ show, setShow ] = React.useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const { signIn } = useAuth();  
	const handleSignIn = async () => {
		try {
			await signIn(email, password, isSignIn);
		} catch (e) {
			window.alert(e);
		}
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
						{isSignIn ? "Sign In" : "Sign up"}
					</Heading>
					<Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
						Enter your email and password
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
							Email<Text color={brandStars}>*</Text>
						</FormLabel>
						<Input
							isRequired={true}
							variant='auth'
							fontSize='sm'
							ms={{ base: '0px', md: '0px' }}
							type='email'
							value={email || ""}
        					onChange={(e) => setEmail(e.target.value)}
							placeholder='jdoe@gmail.com'
							mb='24px'
							fontWeight='500'
							size='lg'
						/>
						<FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} display='flex'>
							Password<Text color={brandStars}>*</Text>
						</FormLabel>
						<InputGroup size='md'>
							<Input
								value={password || ""}
								onChange={(e) => setPassword(e.target.value)}	
								isRequired={true}
								fontSize='sm'
								placeholder='Min. 8 characters'
								mb='24px'
								size='lg'
								type={show ? 'text' : 'password'}
								variant='auth'
							/>
							<InputRightElement display='flex' alignItems='center' mt='4px'>
								<Icon
									color={textColorSecondary}
									_hover={{ cursor: 'pointer' }}
									as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
									onClick={() => setShow(!show)}
								/>
							</InputRightElement>
						</InputGroup>
						<Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' onClick={handleSignIn}>
							{isSignIn ? "Sign In" : "Create an account"}
						</Button>
					</FormControl>
					<Flex flexDirection='column' justifyContent='center' alignItems='start' maxW='100%' mt='0px'>
						<Text color={textColorDetails} fontWeight='400' fontSize='14px'>
							{isSignIn ? "Not registered yet?" : "Already have an account?"}
							<Button onClick={() => setIsSignIn(!isSignIn)} variant="link">
								<a>
									<Text color={textColorBrand} as='span' ms='5px' fontWeight='500'>
										{isSignIn ? "Create an Account" : "Sign in"}
									</Text>
								</a>
							</Button>
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</DefaultAuthLayout>
	);
}