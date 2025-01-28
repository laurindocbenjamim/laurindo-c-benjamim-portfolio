

// Error handling utility
export const handleApiError = (error) => {
    const defaultMessage = 'An error occurred. Please try again.';
    const message = error.response?.data?.error || defaultMessage;
    
    // Display error to user
    alert(message);
    
    // Log detailed error
    console.error({
      message: error.message,
      response: error.response,
      stack: error.stack
    });
  };
  
  // API call example
export const updateProfile = async (data) => {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };