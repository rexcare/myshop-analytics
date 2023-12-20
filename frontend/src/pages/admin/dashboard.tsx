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
	const textColor = useColorModeValue('navy.700', 'white');

  const { company, authUser } = useAuth();
  const access_token = router.query?.access_token || authUser?.accessToken;
  const company_name = router.query?.company_name || company?.firebaseId?.replaceAll(/\W/g, '_');
  
  const [embeddedUrl, setEmbeddedUrl] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
		if (access_token && company_name) {
      const params = `%7B"ds3":%7B"token":"${access_token}",%20"companyName":%20"${company_name}"%7D%7D`;
      // FIXME fetch base url from BE
      const dashboardUrl = `https://lookerstudio.google.com/embed/reporting/a541c5db-616f-4a98-8473-1bbdd764d694/page/RvFVD?params=${params}`;
      setEmbeddedUrl(dashboardUrl);
      setIsAnonymous(false);
		} else {
      setIsAnonymous(true);
    }
	}, [access_token, company_name]);

  return (
    <AdminLayout>
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      { isAnonymous 
      ? (
          <Text color={textColor} fontWeight='400' fontSize={22}>
            You must be signed in to view the Home dashboard
          </Text>
      )
      : (
        !company?.bigQuery?.shopifyExportedAt 
          ? <Text color={textColor} fontWeight='400' fontSize={22}>
              We are loading the data, which may take a few minutes. Try refreshing the page in a bit!
            </Text>
          :
        <iframe 
          width="100%" 
          height="1200" 
          style={{borderRadius: 16}}
          src={embeddedUrl}
          >        
        </iframe>
      )
      }
    </Box>
    </AdminLayout>
  );
}
