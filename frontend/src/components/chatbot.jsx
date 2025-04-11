import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Drawer, 
  DrawerBody, 
  DrawerHeader, 
  DrawerOverlay, 
  DrawerContent, 
  DrawerCloseButton,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

const STORAGE_KEY = 'chatbot_messages';

const ChatMessage = ({ message, isBot }) => (
  <Box
    alignSelf={isBot ? "flex-start" : "flex-end"}
    bg={isBot ? "blue.800" : "green.800"}
    p="3"
    borderRadius="lg"
    maxW="80%"
    mb="2"
  >
    <Text color="whiteAlpha.900">{message}</Text>
  </Box>
);

const Chatbot = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {

    onOpen();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        userMessage,
        conversationHistory: messages.map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        }))
      });

      setMessages(prev => [...prev, { text: response.data.botReply, isBot: true }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error. Please try again.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const chatButton = document.getElementById('chat-button');
    if (chatButton) {
      chatButton.style.display = isOpen ? 'none' : 'flex';
    }
  }, [isOpen]);

  return (
    <>
      <IconButton
        id="chat-button"
        icon={<MessageSquare />}
        position="fixed"
        bottom="4"
        right="4"
        colorScheme="blue"
        borderRadius="full"
        size="lg"
        onClick={handleNewChat}
        zIndex="tooltip"
      />

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent bg="gray.800">
          <DrawerCloseButton color="white" />
          <DrawerHeader 
            borderBottomWidth="1px" 
            borderBottomColor="gray.600" 
            color="white"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Chat with AI Assistant
          </DrawerHeader>

          <DrawerBody p="0" bg="gray.900">
            <VStack h="full" spacing="0">
              <VStack
                flex="1"
                w="full"
                overflowY="auto"
                spacing="4"
                p="4"
                alignItems="stretch"
              >
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isBot={message.isBot}
                  />
                ))}
                {isLoading && (
                  <Box alignSelf="flex-start">
                    <Spinner size="sm" color="blue.200" />
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </VStack>

              <Box
                p="4"
                borderTopWidth="1px"
                borderTopColor="gray.600"
                w="full"
                bg="gray.800"
              >
                <HStack>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    bg="gray.700"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  />
                  <IconButton
                    icon={<Send size={20} />}
                    onClick={handleSendMessage}
                    isLoading={isLoading}
                    colorScheme="blue"
                    aria-label="Send message"
                  />
                </HStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Chatbot;