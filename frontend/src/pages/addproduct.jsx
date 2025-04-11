import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  useToast,
  Box
} from '@chakra-ui/react';
import axios from 'axios';

const AddProduct = () => {
  const toast = useToast();
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    photo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const userData = JSON.parse(localStorage.getItem('userData'));
    const seller_id=userData.data._id;

    try {
      const response = await axios.post('http://localhost:5000/api/products', {
        ...productData,
        price: parseFloat(productData.price),
        seller_id,
        sold: false
      });

      toast({
        title: "Product Added",
        description: "Your product has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      setProductData({
        name: '',
        price: '',
        description: '',
        category: '',
        photo: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box maxWidth="500px" margin="auto" p={6}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Product Name</FormLabel>
            <Input
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Price</FormLabel>
            <Input
              name="price"
              type="number"
              value={productData.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={productData.description}
              onChange={handleChange}
              placeholder="Enter product description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              name="category"
              value={productData.category}
              onChange={handleChange}
              placeholder="Select category"
            >
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Furniture">Furniture</option>
              <option value="Sports">Sports</option>
              <option value="Beauty">Beauty</option>
              <option value="Toys">Toys</option>
              <option value="Food">Food</option>
              <option value="Stationery">Stationery</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Photo URL</FormLabel>
            <Input
              name="photo"
              value={productData.photo}
              onChange={handleChange}
              placeholder="Enter photo URL"
            />
          </FormControl>

          <Button 
            colorScheme="blue" 
            type="submit" 
            width="full"
          >
            Add Product
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AddProduct;