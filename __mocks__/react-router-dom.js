// __mocks__/react-router-dom.js
import React from 'react';
export const useNavigate = () => jest.fn();
export const Link = ({ children, ...props }) => React.createElement('a', { ...props }, children);
export default {
  useNavigate,
  Link,
};