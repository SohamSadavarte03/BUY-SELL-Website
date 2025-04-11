import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Flex,
  Spinner,
  Center,
  Button,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

const PendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData.data._id;
        const response = await axios.get(`http://localhost:5000/api/orders/pending/${userId}`);
        if (response.data.success) {
          const ordersWithOTP = response.data.orders;
          const uniqueOrdersMap = new Map();
          ordersWithOTP.forEach(order => {
            // if (!uniqueOrdersMap.has(order.product_id._id)) {
              uniqueOrdersMap.set(order.product_id._id, order);
            // }
          });
          setPendingOrders(Array.from(uniqueOrdersMap.values()));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending orders",
          status: "error",
          duration: 2000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [toast]);

  const regenerateOTP = async (orderId) => {
    try {
      const otpResponse = await axios.post(`http://localhost:5000/api/orders/otp/${orderId}`);
      if (otpResponse.data.success) {
        const newOTP = otpResponse.data.otp;
        setPendingOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, otp: newOTP } : order
          )
        );
        toast({
          title: "OTP Generated",
          description: `New OTP: ${newOTP}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error(`Error generating OTP for order ${orderId}:`, error);
      toast({
        title: "Error",
        description: "Failed to generate OTP",
        status: "error",
        duration: 2000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={6}>Current Orders</Text>

      {pendingOrders.length === 0 ? (
        <Text>No Orders Placed</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {pendingOrders.map((order) => (
            <Flex
              key={order.product_id._id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              flexDirection="column"
            >
              <Flex alignItems="center" mb={4}>
                <Image
                  src={order.product_id.photo}
                  alt={order.product_id.name}
                  boxSize="100px"
                  objectFit="cover"
                  mr={4}
                />

                <VStack align="start" flex={1}>
                  <Text fontWeight="bold">{order.product_id.name}</Text>
                  <Text color="green.500">${order.product_id.price}</Text>
                  <Text>Seller: {order.seller_id?.first_name || "Unknown"} {order.seller_id?.last_name || ""}</Text>
                </VStack>
              </Flex>

              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Order Status: Pending</Text>
                <Button colorScheme="blue" onClick={() => regenerateOTP(order._id)}>
                  Regenerate OTP
                </Button>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PendingOrders;
