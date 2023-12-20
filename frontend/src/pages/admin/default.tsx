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

import {
  Box,
  SimpleGrid,
  CircularProgress,
  useColorModeValue,
  Icon,
  Text
} from '@chakra-ui/react'
import TotalOrders from 'views/admin/default/components/TotalOrders'
import AdminLayout from 'layouts/admin'
import MiniStatistics from 'components/card/MiniStatistics'
import IconBox from 'components/icons/IconBox'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useGet } from "restful-react";
import {
  MdBarChart,
} from 'react-icons/md'
import { useAuth } from 'contexts/AuthUserContext';



interface ShopifyAggregation {
  periods: string[];
  series: { data: number[]; name: string }[];
}

interface ShopifyOrdersResponse {
  order_sum?: ShopifyAggregation;
  order_counts?: ShopifyAggregation;
  product_sums?: ShopifyAggregation;
  product_counts?: ShopifyAggregation;
  user_journey?: ShopifyAggregation;
  user_journey_percent?: ShopifyAggregation;
}

function sumArray(ray: number[], round: number) {
  return ray.reduce((partialSum, a) => partialSum + a, 0).toFixed(round);
}



export default function UserReports () {
  // Fetch data
	const router = useRouter();
  const brandColor = useColorModeValue('brand.500', 'white')
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100')
	
  const { company } = useAuth();
  const access_token = router.query?.access_token || company?.shopifyIntegration?.token;
  const shop = router.query?.shop || company?.shopifyIntegration?.storeName;
	const limit = router.query?.limit || "1000";
	const maxSeries = Number(router.query?.maxSeries || "5");

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/shopify/orders?access_token=${access_token}&shop=${shop}&limit=${limit}`;
  const [shopifyData, setShopifyData] = useState<ShopifyOrdersResponse>();
	const { data, loading, refetch: fetchOrders } = useGet({ path: apiUrl, lazy: true });

  useEffect(() => {
		if (access_token && shop) {
			fetchOrders();
		}
	}, [access_token, shop]);

	useEffect(() => {
		if (data) {
      setShopifyData(data);
		}
	}, [data]);

  
  if (loading) {
    return (
      <AdminLayout>
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
          <CircularProgress color="blue" isIndeterminate />
          <Text fontSize="2xl">Fetching your last {limit} orders ...</Text>
        </Box>
      </AdminLayout>
    );
  }

  const totalOrders = sumArray(shopifyData?.order_counts?.series?.map(s => s.data)?.flat() || [], 0);
  const totalSales = sumArray(shopifyData?.order_sum?.series?.map(s => s.data)?.flat() || [], 2);

  return (
    <AdminLayout>
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <>     
          <SimpleGrid columns={2} gap='20px' mb='20px'>
            <MiniStatistics
               startContent={
                 <IconBox
                   w='56px'
                   h='56px'
                   bg={boxBg}
                   icon={
                     <Icon
                       w='32px'
                       h='32px'
                       as={MdBarChart}
                       color={brandColor}
                     />
                   }
                 />
               }
               name='Total sales'
               value={`$ ${totalSales}`}
             />
             <MiniStatistics
               startContent={
                 <IconBox
                   w='56px'
                   h='56px'
                   bg={boxBg}
                   icon={
                     <Icon
                       w='32px'
                       h='32px'
                       as={MdBarChart}
                       color={brandColor}
                     />
                   }
                 />
               }
               name='Total orders'
               value={totalOrders}
             />
            <TotalOrders periods={shopifyData?.order_sum?.periods || []} dataSeries={shopifyData?.order_sum?.series || []} aggregateLabel='Total sales ($)' title='Orders sales' />
            <TotalOrders periods={shopifyData?.order_counts?.periods || []} dataSeries={shopifyData?.order_counts?.series || []} aggregateLabel='# of orders' title='Orders quantity' />
          </SimpleGrid>
          <SimpleGrid columns={2} gap='20px' mb='20px'>
            <TotalOrders maxSeries={maxSeries} periods={shopifyData?.product_sums?.periods || []} dataSeries={shopifyData?.product_sums?.series || []} aggregateLabel='Total product sales ($)' title='Product sales' />
            <TotalOrders maxSeries={maxSeries} periods={shopifyData?.product_counts?.periods || []} dataSeries={shopifyData?.product_counts?.series || []} aggregateLabel='# of products' title='Product quantity' />
          </SimpleGrid>
          <SimpleGrid columns={2} gap='20px' mb='20px'>
            <TotalOrders maxSeries={maxSeries} periods={shopifyData?.user_journey?.periods?.map(p => `Purchase ${p}`) || []} dataSeries={shopifyData?.user_journey?.series || []} aggregateLabel='# Unique customers' title='User journey' />
            <TotalOrders maxSeries={maxSeries} periods={shopifyData?.user_journey_percent?.periods?.map(p => `Purchase ${p}`) || []} dataSeries={shopifyData?.user_journey_percent?.series || []} aggregateLabel='% original customers' title='User journey %' />
          </SimpleGrid>
        </>
      </Box>
    </AdminLayout>
  )
}
