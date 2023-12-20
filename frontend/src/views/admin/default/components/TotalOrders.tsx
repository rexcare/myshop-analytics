// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import BarChart from 'components/charts/BarChart';
import { MdBarChart } from 'react-icons/md';


function getTopObjectsBySum(arr: any[], n: number, useLatest?: boolean) {
	// Sort the objects based on the sum of their 'data' array property
	const sortedObjects = arr.sort((a, b) => {
		let sumA = 0;
		let sumB = 0;
		if (useLatest) {
			sumA = a.data[a.data.length - 1];
			sumB = b.data[b.data.length - 1];
		} else {
			sumA = a.data.reduce((acc: number, val: number) => acc + val, 0);
			sumB = b.data.reduce((acc: number, val: number) => acc + val, 0);	  
		}
	  return sumB - sumA; // Sort in descending order
	});
  
	// Return the top 'n' objects
	return sortedObjects.slice(0, n);
}


export default function TotalOrders(props: { [x: string]: any }) {
	const { periods, dataSeries: allDataSeries, aggregateLabel, title, maxSeries, ...rest } = props;

	const dataSeries = getTopObjectsBySum(allDataSeries, maxSeries || 5);

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const chartOptions = {
		chart: {
		  type: 'bar',
		  height: 350,
		},
		dataLabels: {
			enabled: false, // Set dataLabels to not display
		},
		xaxis: {
		  categories: periods,
		},
		yaxis: {
		  title: {
			text: aggregateLabel
		  }
		},
		series: dataSeries,
		legend: {
			position: 'bottom',
			offsetY: 0,
			height: 60,
			markers: {
			  width: 18,
			  height: 18,
			  radius: 4
			},
			itemMargin: {
			  horizontal: 4,
			  vertical: 4,
			},
			containerMargin: {
			  left: 0,
			  right: 0,
			  top: 0,
			  bottom: 0
			},
			scrollable: {
			  enabled: true,
			  maxWidth: 400
			},
		}
	};

	return (
		<Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' mb='0px' {...rest}>
			<Flex flexDirection='column'>
				<Text color={textColor} fontSize='26px' textAlign='start' fontWeight='700' lineHeight='100%'>
					{title}
				</Text>
			</Flex>
			<Flex w='100%'>
				<Box minH='360px' minW='95%' mt='auto'>
					{!!chartOptions?.series?.length && <BarChart chartData={chartOptions?.series || []} chartOptions={chartOptions as any} />}
				</Box>
			</Flex>
		</Card>
	);
}
