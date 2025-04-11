import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import {
  Flex,
  VStack,
  Box,
  Heading,
  Input,
  Button,
  useColorMode,
  useColorModeValue,
  Text,
  Link,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Icon,
  Divider,
  ScaleFade
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBirthdayCake } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/authcontext';

const Login = () => {
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const formBackground = useColorModeValue('gray.100', 'gray.700');
  const { setUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSignup = () => {
    setIsSignup(!isSignup);
    setCaptchaToken('');
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleCASLogin = () => {
    console.log("CAS login clicked");
    const serviceUrl = encodeURIComponent('http://localhost:5173/cas-callback');
    const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${serviceUrl}&renew=true`;
    window.location.href = casLoginUrl;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/register',
        {
          firstName: firstName,
          lastName: lastName,
          contactNumber: contactNumber,
          email,
          password,
          age: parseInt(age),
        }
      );

      if (response.data.error) {
        toast.error(`Signup error: ${response.data.error}`);
      } else {
        setFirstName('');
        setLastName('');
        setContactNumber('');
        setEmail('');
        setPassword('');
        setAge('');
        toast.success('Signup successful! Please login.');
        setIsSignup(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
        captchaToken,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      localStorage.setItem('userData', JSON.stringify({ data: user }));
      setUser(user);

      toast.success("Login successful!");

      const from = '/profile';
      navigate("/profile");
      window.location.reload();


      setEmail('');
      setPassword('');
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || 'Login failed');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex 
      h="100vh" 
      alignItems="center" 
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
      p={4}
      
    >
      <ScaleFade in={true} initialScale={0.9}>
        <Box
          bg={formBackground}
          p={8}
          borderRadius="xl"
          boxShadow="2xl"
          width="100%"
          maxW="700px"
          position="relative"
          overflow="hidden"
        >
          <VStack spacing={6} align="stretch">
            <Heading 
              textAlign="center" 
              mb={4} 
              size="xl" 
              color={useColorModeValue('teal.600', 'teal.300')}
            >
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Heading>

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              <VStack spacing={4}>
                {isSignup && (
                  <Flex width="full" gap={3}>
                    <FormControl>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaUser} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="First Name"
                          variant="filled"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaUser} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Last Name"
                          variant="filled"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>
                )}

                {isSignup && (
                  <Flex width="full" gap={3}>
                    <FormControl>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaPhone} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Contact Number"
                          type="tel"
                          variant="filled"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaBirthdayCake} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Age"
                          type="number"
                          variant="filled"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>
                )}

                <FormControl>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaEnvelope} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Email"
                      type="email"
                      variant="filled"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaLock} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Password"
                      type="password"
                      variant="filled"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                </FormControl>

                {!isSignup && (
                  <Box width="full" display="flex" justifyContent="center">
                    <ReCAPTCHA
                      sitekey="6Lfc4MMqAAAAAGecjZ1UGGDD-akG6R20HPhzZcwV"
                      onChange={handleCaptchaChange}
                    />
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="teal"
                  width="full"
                  size="lg"
                  isLoading={isLoading}
                >
                  {isSignup ? 'Sign Up' : 'Log In'}
                </Button>
              </VStack>
            </form>

            <Divider />

            <Button
              colorScheme="orange"
              width="full"
              size="lg"
              onClick={handleCASLogin}
            >
              Login with IIIT Account
            </Button>

            <Text textAlign="center">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link color="teal.500" onClick={toggleSignup} fontWeight="bold">
                    Log In
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link color="teal.500" onClick={toggleSignup} fontWeight="bold">
                    Sign Up
                  </Link>
                </>
              )}
            </Text>
          </VStack>
        </Box>
      </ScaleFade>
      <ToastContainer />
    </Flex>
  );
};

export default Login;