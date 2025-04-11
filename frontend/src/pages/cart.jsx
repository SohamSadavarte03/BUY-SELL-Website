import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  Flex,
  Spacer,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import axios from 'axios';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userId = userData.data._id;

        const response = await axios.get(`http://localhost:5000/api/users/cart/${userId}`);
        
        if (response.data.success) {
          setCartItems(response.data.cartItems);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast({
          title: "Error",
          description: "Failed to fetch cart items",
          status: "error",
          duration: 2000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const removeFromCart = async (productId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.data._id;
      const response = await axios.delete('http://localhost:5000/api/users/cart/remove', {
        data: { userId, productId }
      });
      if (response.data.success) {
        const updatedCart = cartItems.filter(item => item._id !== productId);
        setCartItems(updatedCart);
        
        toast({
          title: "Product Removed",
          status: "warning",
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        status: "error",
        duration: 2000,
        isClosable: true
      });
    }
  };

  const proceedToCheckout = async () => {
    if (isCheckingOut) return; 
    
    try {
      setIsCheckingOut(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const buyerId = userData.data._id;

      const orderPromises = cartItems.map(async (item) => {
        const orderData = {
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          buyer_id: buyerId,
          seller_id: item.seller_id,
          amount: item.price,
          status: "Pending",
          product_id: item._id
        };
        
        await axios.put(`http://localhost:5000/api/products/sold/${item._id}`);
        return axios.post('http://localhost:5000/api/orders', orderData);
      });

      await Promise.all(orderPromises);

      await axios.delete(`http://localhost:5000/api/users/cart/clear/${buyerId}`);

      setCartItems([]);

      toast({
        title: "Checkout Successful",
        description: "Orders created and cart cleared",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Checkout Failed",
        description: "Unable to complete checkout",
        status: "error",
        duration: 2000,
        isClosable: true
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * (item.quantity || 1)), 0
    ).toFixed(2);
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
      <Text fontSize="2xl" mb={6}>My Cart</Text>
      
      {cartItems.length === 0 ? (
        <Text>Your cart is empty</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {cartItems.map((item) => (
            <Flex 
              key={item._id} 
              borderWidth="1px" 
              borderRadius="lg" 
              p={4} 
              alignItems="center"
            >
              <Image 
                src={item.photo} 
                alt={item.name} 
                boxSize="100px" 
                objectFit="cover" 
                mr={4}
              />
              
              <VStack align="start" flex={1}>
                <Text fontWeight="bold">{item.name}</Text>
                <Text color="green.500">${item.price.toFixed(2)}</Text>
              </VStack>
              
              <Button 
                colorScheme="red" 
                onClick={() => removeFromCart(item._id)}
                isDisabled={isCheckingOut}
              >
                Remove
              </Button>
            </Flex>
          ))}
          
          <Flex mt={6} alignItems="center">
            <Text fontSize="xl" fontWeight="bold">
              Total: ${calculateTotal()}
            </Text>
            <Spacer />
            <Button 
              colorScheme="green" 
              size="lg"
              onClick={proceedToCheckout}
              isDisabled={cartItems.length === 0 || isCheckingOut}
              isLoading={isCheckingOut}
              loadingText="Processing"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </Flex>
        </VStack>
      )}
    </Box>
  );
};

export default CartPage;