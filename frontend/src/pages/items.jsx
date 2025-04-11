import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  Spinner,
  Center,
  Button,
  Input,
  Checkbox,
  Flex,
  useToast,
  Container,
  InputGroup,
  InputLeftElement,
  Badge,
  ScaleFade
} from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDisplay = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const response = await axios.get('http://localhost:5000/api/products');
        const productData = response.data.data || response.data || [];
        const availableProducts = productData.filter(product =>
          !product.sold && product.seller_id !== userData.data._id
        );
        console.log('userData:', userData.data, "productData:", productData);


        const categories = [...new Set(availableProducts.map(product => product.category))];

        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
        setAvailableCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategories.length > 0) {
      result = result.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    if (searchTerm.trim()) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategories, products]);

  const addToCart = async (product) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.data._id;

      const response = await axios.post('http://localhost:5000/api/users/cart', {
        userId: userId,
        productId: product._id
      });
      
      if (!response.error) {
        // console.log('Add to cart response:', response.data.message);

        if (response.data.message == "Product already in cart.") {
          toast({
            title: "Product Already in Cart",
            status: "warning",
            duration: 2000,
            isClosable: true
          });
        } else {


          const updatedCart = [...cart, { ...product, quantity: 1 }];
          setCart(updatedCart);
          localStorage.setItem('cart', JSON.stringify(updatedCart));

          toast({
            title: "Added to Cart",
            description: `${product.name} added to cart`,
            status: "success",
            duration: 2000,
            isClosable: true
          });
        }
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

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  
  if (loading) {
    return (
      <Center height="100vh" bg="gray.900">
        <Spinner size="xl" color="blue.400" thickness="4px" />
      </Center>
    );
  }

  const categoryColors = {
    Electronics: 'blue',
    Clothing: 'green',
    Food: 'orange',
    Beauty: 'pink',
    Sports: 'purple',
    Books: 'teal',
    Toys: 'yellow',
    Furniture: 'red',
    Stationery: 'cyan',
    Tools: 'whiteAlpha',
    Other: 'blackAlpha'
  };

  return (
    <Box bg="gray.900" minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Box  
          position="sticky" 
          top={0} 
          bg="gray.800" 
          pt={4} 
          pb={6} 
          zIndex={1}
          borderBottom="1px"
          borderColor="gray.700"
          boxShadow="dark-lg"
        >
          <VStack spacing={4} align="center">
            <InputGroup size="lg" maxW={{ base: '90%', md: '500px' }}>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="full"
                borderWidth="2px"
                borderColor="gray.600"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ borderColor: 'gray.500' }}
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px blue.400'
                }}
              />
            </InputGroup>

            <Flex 
              wrap="wrap" 
              gap={3}
              justify="center"
              maxW={{ base: '90%', md: '700px' }}
              mx="auto"
            >
              {availableCategories.map(category => (
                <Checkbox
                  key={category}
                  isChecked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  colorScheme={categoryColors[category] || 'gray'}
                  sx={{
                    '.chakra-checkbox__control': {
                      borderColor: 'gray.500',
                      bg: 'gray.700',
                      borderRadius: 'full',
                      _checked: {
                        bg: `${categoryColors[category]}.400`,
                        borderColor: `${categoryColors[category]}.400`,
                      }
                    },
                    '.chakra-checkbox__label': {
                      color: 'gray.200'
                    }
                  }}
                >
                  <Text fontSize="sm" fontWeight="medium">{category}</Text>
                </Checkbox>
              ))}
            </Flex>
          </VStack>
        </Box>

        {filteredProducts.length === 0 ? (
          <Center height="200px">
            <Text fontSize="lg" color="gray.400">No products found</Text>
          </Center>
        ) : (
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)'
            }}
            gap={6}
            py={6}
          >
            {filteredProducts.map((product) => (
              <ScaleFade in={true} key={product._id}>
                <Box
                  borderWidth="1px"
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="dark-lg"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '2xl',
                  }}
                  bg="gray.800"
                  borderColor="gray.700"
                >
                  <Box onClick={() => handleProductClick(product._id)} cursor="pointer">
                    <Box position="relative">
                      <Image
                        src={product.photo}
                        alt={product.name}
                        objectFit="cover"
                        h="300px"
                        w="100%"
                        transition="transform 0.2s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme={categoryColors[product.category] || 'gray'}
                        borderRadius="full"
                        px={3}
                        py={1}
                        bg={`${categoryColors[product.category]}.400`}
                        color="white"
                      >
                        {product.category}
                      </Badge>
                    </Box>
                    
                    <VStack p={6} align="start" spacing={3}>
                      <Text 
                        fontWeight="bold" 
                        fontSize="xl"
                        color="white"
                        noOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text 
                        color="green.400" 
                        fontSize="lg"
                        fontWeight="bold"
                      >
                        ${product.price.toFixed(2)}
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Box p={4} pt={0}>
                    <Button
                      colorScheme="blue"
                      width="full"
                      size="lg"
                      borderRadius="full"
                      onClick={() => addToCart(product)}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                        bg: 'blue.500'
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </Box>
              </ScaleFade>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ProductDisplay;