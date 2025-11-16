# Requirements Document

## Introduction

The Calculation Tree Application is a social communication platform where users interact through mathematical operations. Users can initiate discussions by posting starting numbers, and others can respond by applying mathematical operations (addition, subtraction, multiplication, division) to create branching calculation trees, similar to comment threads in social networks.

## Glossary

- **Application**: The Calculation Tree Application system
- **User**: An individual interacting with the Application
- **Unregistered User**: A User who has not created an account or logged in
- **Registered User**: A User who has created an account and completed authentication
- **Starting Number**: A numerical value that initiates a calculation tree
- **Operation**: A mathematical function (addition, subtraction, multiplication, or division) applied to a number
- **Calculation Tree**: A hierarchical structure of operations starting from a Starting Number, where each node represents a calculation result
- **Calculation Node**: A single point in a Calculation Tree containing a numerical result
- **Left Argument**: The number from the previous step in the calculation chain
- **Right Argument**: A number chosen by the User when publishing an Operation
- **Authentication**: The process of verifying a User's identity using username and password

## Requirements

### Requirement 1

**User Story:** As an unregistered user, I want to view all calculation trees on the page, so that I can see the mathematical discussions happening in the community.

#### Acceptance Criteria

1. WHEN an Unregistered User accesses the Application, THE Application SHALL display all Calculation Trees with their Starting Numbers
2. THE Application SHALL display each Operation in a Calculation Tree showing the operation type, Right Argument, and resulting value
3. THE Application SHALL present Calculation Trees in a hierarchical visual structure showing parent-child relationships between calculations
4. THE Application SHALL render all Calculation Nodes with their computed numerical results

### Requirement 2

**User Story:** As an unregistered user, I want to create an account with a username and password, so that I can participate in creating calculation trees.

#### Acceptance Criteria

1. THE Application SHALL provide a registration interface accepting username and password inputs
2. WHEN an Unregistered User submits valid registration credentials, THE Application SHALL create a new user account
3. THE Application SHALL validate that the username is unique before creating an account
4. THE Application SHALL require a password with a minimum length of 6 characters
5. IF the username already exists, THEN THE Application SHALL display an error message indicating the username is taken

### Requirement 3

**User Story:** As an unregistered user, I want to authenticate with my username and password, so that I can access registered user features.

#### Acceptance Criteria

1. THE Application SHALL provide a login interface accepting username and password inputs
2. WHEN an Unregistered User submits valid authentication credentials, THE Application SHALL authenticate the User and grant Registered User access
3. IF authentication credentials are invalid, THEN THE Application SHALL display an error message and deny access
4. WHEN authentication succeeds, THE Application SHALL maintain the User's authenticated session
5. THE Application SHALL provide a logout mechanism for Registered Users to end their session

### Requirement 4

**User Story:** As a registered user, I want to publish a starting number, so that I can initiate a new calculation tree discussion.

#### Acceptance Criteria

1. WHILE a User is authenticated as a Registered User, THE Application SHALL provide an interface to publish a Starting Number
2. WHEN a Registered User submits a valid numerical Starting Number, THE Application SHALL create a new Calculation Tree with that Starting Number as the root
3. THE Application SHALL accept integer and decimal numbers as valid Starting Numbers
4. THE Application SHALL display the newly created Calculation Tree immediately after creation
5. THE Application SHALL associate the Starting Number with the Registered User who created it

### Requirement 5

**User Story:** As a registered user, I want to add an operation to any calculation node, so that I can contribute to the mathematical discussion.

#### Acceptance Criteria

1. WHILE a User is authenticated as a Registered User, THE Application SHALL provide an interface to add Operations to any Calculation Node
2. THE Application SHALL accept four operation types: addition, subtraction, multiplication, and division
3. WHEN a Registered User selects a Calculation Node and submits an Operation with a Right Argument, THE Application SHALL compute the result using the Calculation Node's value as the Left Argument
4. THE Application SHALL create a new Calculation Node as a child of the selected Calculation Node with the computed result
5. IF the Operation is division and the Right Argument is zero, THEN THE Application SHALL display an error message and prevent the Operation

### Requirement 6

**User Story:** As a registered user, I want to respond to any calculation in the tree, so that I can create branching discussions from any point.

#### Acceptance Criteria

1. WHILE a User is authenticated as a Registered User, THE Application SHALL allow Operations to be added to any Calculation Node regardless of depth in the tree
2. THE Application SHALL support multiple child Operations on a single Calculation Node creating branches in the Calculation Tree
3. WHEN a Registered User adds an Operation to a Calculation Node, THE Application SHALL update the Calculation Tree structure to reflect the new branch
4. THE Application SHALL display all branches of a Calculation Tree in the hierarchical visual structure

### Requirement 7

**User Story:** As a user, I want the application to persist my data, so that calculation trees and accounts are available across sessions.

#### Acceptance Criteria

1. THE Application SHALL store all user accounts persistently on the server
2. THE Application SHALL store all Calculation Trees and their Operations persistently on the server
3. WHEN the Application restarts, THE Application SHALL restore all user accounts and Calculation Trees from persistent storage
4. THE Application SHALL maintain data integrity across server restarts

### Requirement 8

**User Story:** As a developer, I want the application to use a client-server architecture, so that the system is scalable and maintainable.

#### Acceptance Criteria

1. THE Application SHALL implement a server component using NodeJS and TypeScript
2. THE Application SHALL implement a client component using React and TypeScript
3. THE Application SHALL define a communication protocol between client and server for all data operations
4. THE Application SHALL use Docker Compose for deployment and orchestration
5. THE Application SHALL function correctly in the latest version of Chrome browser
