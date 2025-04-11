import React from 'react';
import {
  Box,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import  {useAuth}  from "../context/authcontext";
const Navbar = () => {
  const {  setUser } = useAuth();
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('black', 'white');


  const handleLogout = async () => {
 
    localStorage.removeItem('token');
    localStorage.removeItem('token-cas');
    localStorage.removeItem('userData'); 
    delete axios.defaults.headers.common["Authorization"]; 
    setUser(null);
    const serviceUrl = encodeURIComponent('http://localhost:5173');
    
    window.location.href = `https://login.iiit.ac.in/cas/logout?service=${serviceUrl}&destroySession=true`;
    window.location.reload();
  };
  

  return (
    <Flex
      as="nav"
      height="60px"
      padding="0.5rem"
      align="center"
      justify="space-between"
      wrap="wrap"
      bg={bgColor}
      color={textColor}

    >
      <Box fontWeight="bold" fontSize="xl">
        <Button
          as={RouterLink}
          to="/items"
          variant="ghost"
          p={2}
          fontWeight={'bold'}
          fontSize='l'

        >
          BUY & SELL
        </Button>
      </Box>

      <Flex align="center" justify="center" flex={1}>
        <Button
          as={RouterLink}
          to="/cart"
          p={4}
          mr={2}
          variant="ghost"
          size="md"
          fontSize="l"
        >
          My Cart
        </Button>
        <Button
          as={RouterLink}
          to="/orders"
          mr={2}
          variant="ghost"
          size="md"
          p={4}
          fontSize="l"
        >
          My Orders
        </Button>
        <Button
          as={RouterLink}
          to="/history"
          variant="ghost"
          size="md"
          p={5}
          fontSize="l"
        >
          Order History
        </Button>
        <Button
          as={RouterLink}
          to="/pending"
          variant="ghost"
          size="md"
          p={5}
          fontSize="l"
        >
          Pending Orders
        </Button>
      </Flex>

      <Flex align="center">
        <Button
          mr={4}
          variant="ghost"
          size="md"
          pr={5}
          as={RouterLink}
          to={'/addproduct'}
          fontSize="md">Add Item</Button>

        <Menu>
          <MenuButton>
            <Avatar
              size="sm"
              name="User"
              src="https://bit.ly/dan-abramov"
            />
          </MenuButton>
          <MenuList>
            <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Navbar;