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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Select,
  useDisclosure
} from '@chakra-ui/react';
import axios from 'axios';

const UserOrders = () => {
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.data._id;

      const buyerResponse = await axios.get(`http://localhost:5000/api/orders/buyer/${userId}`);
      if (buyerResponse.data.success) {
        setBuyerOrders(buyerResponse.data.orders);
      }

      const sellerResponse = await axios.get(`http://localhost:5000/api/orders/seller/${userId}`);
      if (sellerResponse.data.success) {
        setSellerOrders(sellerResponse.data.orders);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        status: "error",
        duration: 2000,
        isClosable: true
      });
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await axios.post(
        `http://localhost:5000/api/users/${selectedSeller._id}/review`,
        {
          review,
          rating: parseInt(rating),
          reviewer_id: userData.data._id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast({
        title: "Review Submitted",
        description: "Your review has been successfully submitted",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      setReview('');
      setRating(5);
      onClose();
      fetchUserOrders(); 
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const openReviewModal = (seller) => {
    setSelectedSeller(seller);
    onOpen();
  };

  const renderOrderStatus = (status) => {
    const statusColors = {
      'Pending': 'yellow',
      'Successful': 'green',
      'Cancelled': 'red'
    };
    return (
      <Badge colorScheme={statusColors[status] || 'gray'}>
        {status}
      </Badge>
    );
  };

  const renderOrderList = (orders, type) => {
    if (orders.length === 0) {
      return <Text>No {type} orders</Text>;
    }

    return (
      <VStack spacing={4} align="stretch">
        {orders.map((order) => (
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
                <Text color="green.500">₹{order.product_id.price}</Text>
                {type === 'buyer' ? (
                  <VStack align="start" spacing={2}>
                    <Text>Seller: {order.seller_id.first_name} {order.seller_id.last_name}</Text>
                    {order.status === 'Successful' && (
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={() => openReviewModal(order.seller_id)}
                      >
                        Write Review
                      </Button>
                    )}
                  </VStack>
                ) : (
                  <Text>Buyer: {order.buyer_id.first_name} {order.buyer_id.last_name}</Text>
                )}
              </VStack>
            </Flex>

            <Flex justifyContent="space-between" alignItems="center">
              {renderOrderStatus(order.status || 'Pending')}
            </Flex>
          </Flex>
        ))}
      </VStack>
    );
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
      <Tabs>
        <TabList>
          <Tab>Buyer Orders</Tab>
          <Tab>Seller Orders</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {renderOrderList(buyerOrders, 'buyer')}
          </TabPanel>
          <TabPanel>
            {renderOrderList(sellerOrders, 'seller')}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Write a Review for {selectedSeller?.first_name} {selectedSeller?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Flex>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Box
                    key={star}
                    as="button"
                    onClick={() => setRating(star)}
                    color={star <= rating ? 'yellow.400' : 'gray.300'}
                    fontSize="2xl"
                  >
                    ★
                  </Box>
                ))}
              </Flex>

              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                size="sm"
                resize="vertical"
              />

              <Button colorScheme="blue" width="full" onClick={handleReviewSubmit}>
                Submit Review
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserOrders;