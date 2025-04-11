import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Flex,
  Input,
  Button,
  Tooltip,
  useColorModeValue,
  Container,
  Stack,
  Icon,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const toast=useToast();
  const [isEditing, setIsEditing] = useState(false);
  const formBackground = useColorModeValue('gray.100', 'gray.700');
  const cardBackground = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const response = await axios.get(`http://localhost:5000/api/users/${userData.data._id}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data');
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.put(`http://localhost:5000/api/users/${userData.data._id}`, user);
      setUser(response.data.data);
      setIsEditing(false);
      toast({title: 'Profile updated successfully!', type: 'success'});
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  if (!user) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Text fontSize="lg">Loading...</Text>
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box
          bg={cardBackground}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
        >
          <Heading mb={6} size="lg">Profile Information</Heading>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Text fontWeight="bold" w="150px">First Name:</Text>
              {isEditing ? (
                <Input
                  name="first_name"
                  value={user.first_name}
                  onChange={handleChange}
                  w="full"
                />
              ) : (
                <Text>{user.first_name}</Text>
              )}
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="bold" w="150px">Last Name:</Text>
              {isEditing ? (
                <Input
                  name="last_name"
                  value={user.last_name}
                  onChange={handleChange}
                  w="full"
                />
              ) : (
                <Text>{user.last_name}</Text>
              )}
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="bold" w="150px">Email:</Text>
              {isEditing ? (
                <Input
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  w="full"
                />
              ) : (
                <Text>{user.email}</Text>
              )}
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="bold" w="150px">Age:</Text>
              {isEditing ? (
                <Input
                  name="age"
                  value={user.age}
                  onChange={handleChange}
                  w="full"
                  type="number"
                />
              ) : (
                <Text>{user.age}</Text>
              )}
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="bold" w="150px">Contact Number:</Text>
              {isEditing ? (
                <Input
                  name="contact_number"
                  value={user.contact_number}
                  onChange={handleChange}
                  w="full"
                />
              ) : (
                <Text>{user.contact_number}</Text>
              )}
            </HStack>

            <Button
              colorScheme={isEditing ? "green" : "blue"}
              onClick={isEditing ? handleSave : handleEdit}
              alignSelf="flex-start"
              mt={4}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </VStack>
        </Box>

        <Box
          bg={cardBackground}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
        >
          <Heading mb={6} size="lg">Seller Reviews</Heading>
          <VStack align="stretch" spacing={6}>
            {user.seller_reviews && user.seller_reviews.length > 0 ? (
              user.seller_reviews.map((review, index) => (
                <Box key={index}>
                  <HStack spacing={4} mb={2}>
                    <Avatar 
                      size="sm" 
                      name={review.reviewer_id?.first_name || 'Anonymous'}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">
                        {review.reviewer_id?.first_name || 'Anonymous'}
                      </Text>
                      <HStack>
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            as={StarIcon}
                            color={i < review.rating ? "yellow.400" : "gray.300"}
                            w={4}
                            h={4}
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>
                  <Text pl={12} color="gray.600">{review.review}</Text>
                  {index < user.seller_reviews.length - 1 && (
                    <Divider mt={4} />
                  )}
                </Box>
              ))
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>
                No reviews yet
              </Text>
            )}
          </VStack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Profile;