import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Flex,
  Spinner,
  Center,
  useToast,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import axios from 'axios';

const SellerPendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const sellerId = userData.data._id;
        const response = await axios.get(`http://localhost:5000/api/orders/seller/pending/${sellerId}`);
        if (response.data.success) {
          setPendingOrders(response.data.orders);
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
  }, []);

  const handleVerifyOTP = async () => {
    if (!selectedOrder) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/orders/otpcheck`, {
        orderId: selectedOrder._id,
        otp: otpInput
      });

      if (response.data.success) {
        setPendingOrders(prevOrders => 
          prevOrders.filter(order => order._id !== selectedOrder._id)
        );

        toast({
          title: "Order Verified",
          description: "Order status updated to successful",
          status: "success",
          duration: 2000,
          isClosable: true
        });

        setSelectedOrder(null);
        setOtpInput('');
      } else {
        toast({
          title: "Verification Failed",
          description: "Incorrect OTP",
          status: "error",
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify OTP",
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
      <Text fontSize="2xl" mb={6}>Pending Orders</Text>

      {pendingOrders.length === 0 ? (
        <Text>No pending orders</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {pendingOrders.map((order) => (
            <Flex
              key={order._id}
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
                  <Text>Buyer: {order.buyer_id.first_name} {order.buyer_id.last_name}</Text>
                </VStack>
              </Flex>

              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">
                  Order Status: {order.status || 'Pending'}
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => setSelectedOrder(order)}
                >
                  Verify Order
                </Button>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => {
          setSelectedOrder(null);
          setOtpInput('');
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify Order</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Enter OTP</FormLabel>
              <Input 
                placeholder="Enter OTP" 
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
            </FormControl>
            <Button 
              mt={4} 
              colorScheme="green" 
              onClick={handleVerifyOTP}
            >
              Verify
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SellerPendingOrders;