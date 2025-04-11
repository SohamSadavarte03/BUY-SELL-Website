import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Image, 
  Text, 
  Heading, 
  Button, 
  Flex, 
  useToast,
  Badge,
  Divider
} from '@chakra-ui/react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const toast = useToast();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        console.log('Product details:', response.data.data);
        setProduct(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch product details",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    };

    fetchProductDetails();
  }, [id, toast]);

  const addToCart = async (productId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.data._id;

      const response = await axios.post('http://localhost:5000/api/users/cart', {
        userId: userId,
        productId: product._id
      });
      
      if (!response.error) {
        toast({
          title: "Added to Cart",
          description: `${product.name} added to cart`,
          status: "success",
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        status: "error",
        duration: 2000,
        isClosable: true
      });
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!product) {
    return <Text>Product not found</Text>;
  }

  return (
    <Box bg="gray.900" minH="100vh" py={8}>
      <Flex 
        direction={{ base: "column", md: "row" }}
        maxW="1200px"
        mx="auto"
        bg="gray.800"
        borderRadius="lg"
        overflow="hidden"
        shadow="xl"
      >
        <Box 
          flex={1} 
          position="relative"
          height={{ base: "400px", md: "600px" }}
        >
          <Image 
            src={product.photo} 
            alt={product.name}
            objectFit="cover"
            w="100%"
            h="100%"
            position="absolute"
            top="0"
            left="0"
          />
        </Box>
        
        <VStack 
          flex={1} 
          align="start" 
          spacing={6}
          p={8}
        >
          <Heading size="xl" color="white">
            {product.name}
          </Heading>
          
          <Text fontSize="lg" color="gray.300">
            Seller: {product.seller_id?.first_name + ' ' + product.seller_id?.last_name || "Unknown"}
          </Text>
          
          <Text 
            color="green.400" 
            fontWeight="bold" 
            fontSize="3xl"
          >
            ${product.price.toFixed(2)}
          </Text>
          
          <Badge 
            colorScheme="purple" 
            px={3} 
            py={1} 
            borderRadius="md"
          >
            {product.category}
          </Badge>
          
          <Box color="gray.300">
            <Text fontWeight="semibold" mb={2}>
              Description:
            </Text>
            <Text>{product.description}</Text>
          </Box>
          
          <Divider borderColor="gray.600" />
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            width="full"
            onClick={() => addToCart(product)}
            _hover={{ transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            Add to Cart
          </Button>
          
          <VStack 
            align="start" 
            width="full" 
            spacing={3}
            color="gray.300"
          >
            <Text>
              <Text as="span" fontWeight="bold">Status:</Text>
              {' '}
              {product.sold ? (
                <Badge colorScheme="red">Sold</Badge>
              ) : (
                <Badge colorScheme="green">Available</Badge>
              )}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">Listed on:</Text>
              {' '}
              {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ProductDetails;  