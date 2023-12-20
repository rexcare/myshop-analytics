import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import React, { useState } from 'react'
import theme from 'theme/theme'

import 'styles/Fonts.css'
import 'styles/App.css'
import 'styles/Contact.css'

import 'react-calendar/dist/Calendar.css'
import 'styles/MiniCalendar.css'
import Head from 'next/head'
import { AuthUserProvider, useAuth } from 'contexts/AuthUserContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';


function maybeRedirect(loading: boolean, route: string, authUser: any, company: any) {
  if (loading || !route) return null;

  if (route == '/auth/sign-in') {
    if (company) return '/admin/default';
    else if (authUser) return '/auth/company-setup';
    // No user, so correct state
  } else if (route == '/auth/company-setup') {
    if (company) return '/admin/default';
    else if (!authUser) return '/auth/sign-in';
    // No company but yes user, so correct state
  }}

function SecureApp ({ Component, pageProps }: { Component: AppProps["Component"]; pageProps: AppProps["pageProps"] }) {
  const { authUser, loading, company } = useAuth();
  const router = useRouter();

  const [rerouteLoading, setRerouteLoading] = useState(true);

  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    const redirect = maybeRedirect(loading, router?.route, authUser, company);
    if (!!redirect && redirect !== router?.route) {
      console.log(`redirecting b/c loading ${loading}, route ${router?.route} user: ${!!authUser} company ${!!company}`);
      router.push(redirect);
    } else {
      setRerouteLoading(false);
    }
  }, [authUser, loading, router?.route])
  if (loading || rerouteLoading) {
    return null;
  }
  return (
    <Component {...pageProps} />
  );
}



function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Clear analytics</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#000000' />
      </Head>
      <React.StrictMode>
        <AuthUserProvider>
          <SecureApp Component={Component} pageProps={pageProps}/>
        </AuthUserProvider>
      </React.StrictMode>
    </ChakraProvider>
  )
}

export default MyApp
