# Implementation Plan

- [x] 1. Set up project structure and configuration





  - Create monorepo structure with server and client directories
  - Initialize TypeScript configuration for both server and client
  - Set up package.json files with required dependencies
  - Create Docker and Docker Compose configuration files
  - Configure environment variables and .env files
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 2. Implement database layer and models




  - [x] 2.1 Create SQLite database initialization script







    - Write SQL schema for users, calculation_trees, and calculation_nodes tables
    - Add indexes for foreign keys and frequently queried columns
    - Create database connection utility module
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 2.2 Implement database repository functions












    - Write user CRUD operations (create, findByUsername, findById)
    - Write calculation tree operations (create, findAll, findById)
    - Write calculation node operations (create, findByTreeId with children)
    - Implement recursive query to load tree with all nodes
  - [x] 2.3 Write unit tests for database operations







  - [x] 2.3 Write unit tests for database operations




    - Test user creation and retrieval
    - Test tree and node creation with relationships
    - Test recursive tree loading
    - _Requirements: 7.1, 7.2, 7.4_


- [x] 3. Implement authentication system


  - [x] 3.1 Create authentication service



  - [x] 3.1 Create authentication service



    - Implement password hashing with bcrypt
    - Implement user registration logic with username uniqueness validation
    - Implement login logic with password verification
    - Implement JWT token generation and validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_
  - [x] 3.2 Create authentication middleware







    - Write JWT verification middleware for protected routes
    - Extract user information from token and attach to request
    - Handle authentication errors with appropriate status codes
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 3.3 Write unit tests for authentication






    - Test password hashing and verification
    - Test JWT token generation and validation
    - Test authentication middleware with valid and invalid tokens
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
- [x] 4. Implement calculation logic service


- [ ] 4. Implement calculation logic service

  - [x] 4.1 Create calculation service module


    - Implement operation execution functions (add, subtract, multiply, divide)
    - Implement division by zero validation
    - Implement result computation logic
    - Create helper functions for tree structure building
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [x] 4.2 Write unit tests for calculation logic


    - Test all four operation types with various inputs
    - Test division by zero error handling
    - Test result precision for decimal numbers
    - _Requirements: 5.2, 5.3, 5.4, 5.5_


- [x] 5. Build REST API endpoints




  - [x] 5.1 Implement authentication endpoints


    - Create POST /api/auth/register endpoint with validation
    - Create POST /api/auth/login endpoint with error handling
    - Add request validation for username and password requirements
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_
  - [x] 5.2 Implement calculation tree endpoints


    - Create GET /api/trees endpoint to fetch all trees with nodes
    - Create POST /api/trees endpoint for creating starting numbers (protected)
    - Create POST /api/trees/:treeId/operations endpoint for adding operations (protected)
    - Add input validation for all endpoints
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_
  - [x] 5.3 Implement error handling middleware


    - Create global error handler for Express
    - Format error responses consistently
    - Log errors appropriately
    - _Requirements: All requirements (error handling)_
  - [x] 5.4 Write integration tests for API endpoints


    - Test registration and login flows
    - Test tree creation and retrieval
    - Test operation addition with authentication
    - Test error cases and validation
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 6. Implement WebSocket server for real-time updates




  - [x] 6.1 Create WebSocket server and connection handling


    - Set up WebSocket server alongside Express
    - Implement client connection and subscription management
    - Create broadcast functions for tree and operation events
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.3, 6.4_
  - [x] 6.2 Integrate WebSocket with API endpoints


    - Broadcast tree_created event when new tree is created
    - Broadcast operation_added event when operation is added
    - Ensure events include all necessary data for client updates
    - _Requirements: 4.4, 6.3, 6.4_

- [x] 7. Build React frontend application structure



  - [x] 7.1 Set up React application with TypeScript


    - Initialize React app with TypeScript template
    - Configure React Router for navigation
    - Set up shared TypeScript interfaces matching backend
    - Create basic app layout and routing structure
    - _Requirements: 8.2, 8.5_
  - [x] 7.2 Implement authentication context and state management


    - Create AuthContext for global authentication state
    - Implement login, register, and logout functions
    - Store JWT token in localStorage
    - Add token to API requests via fetch interceptor
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 7.3 Create API service module


    - Write fetch wrapper functions for all API endpoints
    - Implement error handling for network requests
    - Add authentication header injection
    - _Requirements: 8.3_

- [x] 8. Implement authentication UI components





  - [x] 8.1 Create AuthForm component


    - Build form with username and password inputs
    - Implement toggle between login and registration modes
    - Add form validation and error display
    - Handle form submission and API calls
    - Update authentication context on success
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_
  - [x] 8.2 Create navigation and user status display


    - Show login/register buttons for unregistered users
    - Show username and logout button for registered users
    - Implement logout functionality
    - _Requirements: 3.4, 3.5_

- [x] 9. Implement calculation tree display components




  - [x] 9.1 Create CalculationTreeList component


    - Fetch all trees from API on mount
    - Render list of calculation trees
    - Display starting number and creator for each tree
    - Handle loading and error states
    - _Requirements: 1.1, 1.2_
  - [x] 9.2 Create TreeNode component with recursive rendering


    - Display node result, operation, and arguments
    - Recursively render child nodes with proper indentation
    - Implement expand/collapse functionality for nodes with children
    - Show visual indicators for tree structure (lines, branches)
    - Display creator username for each node
    - _Requirements: 1.2, 1.3, 1.4, 6.4_
  - [x] 9.3 Integrate WebSocket for real-time updates


    - Connect to WebSocket server on component mount
    - Subscribe to tree and operation events
    - Update tree list when new trees are created
    - Update specific tree when operations are added
    - Handle WebSocket reconnection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.3, 6.4_

- [x] 10. Implement calculation creation and operation components





  - [x] 10.1 Create CreateStartingNumber component


    - Build form with number input for starting number
    - Add validation for numerical input
    - Call API to create new tree
    - Display success/error messages
    - Only show to registered users
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 10.2 Create AddOperation component


    - Build form with operation type dropdown and right argument input
    - Implement validation (division by zero, numerical input)
    - Call API to add operation to selected node
    - Display success/error messages
    - Show as button/modal next to each node for registered users
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [x] 11. Add styling and UI polish





  - [x] 11.1 Create CSS styles for components


    - Style authentication forms
    - Style calculation tree display with hierarchical visual structure
    - Style operation buttons and forms
    - Add responsive layout
    - Ensure usability in Chrome latest version
    - _Requirements: 1.3, 8.5_

  - [x] 11.2 Improve user experience

    - Add loading spinners for async operations
    - Add success/error toast notifications
    - Improve form validation feedback
    - Add hover effects and visual feedback
    - _Requirements: All requirements (UX)_

- [x] 12. Configure Docker deployment




  - [x] 12.1 Create Dockerfile for server


    - Write multi-stage Dockerfile for Node.js backend
    - Configure production build
    - Set up SQLite database volume mounting
    - _Requirements: 8.4_
  - [x] 12.2 Create Dockerfile for client


    - Write multi-stage Dockerfile for React frontend
    - Configure production build with nginx
    - Set up environment variable injection
    - _Requirements: 8.4_
  - [x] 12.3 Create Docker Compose configuration


    - Define server and client services
    - Configure networking between services
    - Set up volume mounts for database persistence
    - Add environment variables
    - _Requirements: 8.4, 7.3, 7.4_

- [x] 13. Final integration and testing





  - [x] 13.1 Test complete user flows


    - Verify unregistered user can view trees
    - Verify registration and login flow
    - Verify creating starting numbers
    - Verify adding operations to any node
    - Verify real-time updates across browser tabs
    - _Requirements: All requirements_
  - [x] 13.2 Verify Docker deployment


    - Build and run application with Docker Compose
    - Test all functionality in containerized environment
    - Verify data persistence across container restarts
    - _Requirements: 7.3, 7.4, 8.4_
  - [x] 13.3 Run test suite and check coverage


    - Execute all unit and integration tests
    - Generate coverage report
    - Verify coverage meets goals (70%+ for backend)
    - _Requirements: All requirements_
