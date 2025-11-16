# Manual Testing Guide for User Flows

This guide covers manual testing of the complete user flows, particularly those that require browser interaction and real-time WebSocket updates.

## Prerequisites

1. Start the development servers:
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev

   # Terminal 2 - Start frontend client
   cd client
   npm run dev
   ```

2. Open Chrome browser to http://localhost:5173 (or the port shown by Vite)

## Test Flow 1: Unregistered User Can View Trees

**Objective**: Verify that users without accounts can view all calculation trees

### Steps:
1. Open the application in Chrome (without logging in)
2. Verify you can see the main page
3. If there are existing trees, verify they are displayed with:
   - Starting number
   - Creator username
   - All operations in hierarchical structure
   - Results for each calculation

**Expected Result**: ✅ All trees are visible without authentication

---

## Test Flow 2: Registration and Login

**Objective**: Verify user account creation and authentication

### Registration Steps:
1. Click "Register" or navigate to registration form
2. Enter a unique username (e.g., "testuser1")
3. Enter a password (minimum 6 characters, e.g., "password123")
4. Click "Register" button
5. Verify success message appears
6. Verify you are automatically logged in (username shown in navigation)

### Login Steps:
1. If logged in, click "Logout"
2. Click "Login" or navigate to login form
3. Enter the username you just created
4. Enter the correct password
5. Click "Login" button
6. Verify you are logged in (username shown in navigation)

### Error Cases to Test:
- Try registering with an existing username → Should show error
- Try registering with password < 6 characters → Should show error
- Try logging in with wrong password → Should show error
- Try logging in with non-existent username → Should show error

**Expected Results**: 
- ✅ Registration creates new account
- ✅ Login works with correct credentials
- ✅ Appropriate errors shown for invalid inputs

---

## Test Flow 3: Creating Starting Numbers

**Objective**: Verify registered users can create new calculation trees

### Steps:
1. Ensure you are logged in
2. Find the "Create Starting Number" form
3. Enter an integer (e.g., 42)
4. Click "Create" or submit button
5. Verify new tree appears in the list immediately
6. Verify the tree shows:
   - Your username as creator
   - The starting number as the root value

### Additional Tests:
- Create a tree with a decimal number (e.g., 3.14)
- Verify decimal is preserved correctly
- Try creating without being logged in → Should not see the form or get error

**Expected Results**:
- ✅ New trees are created successfully
- ✅ Trees appear immediately after creation
- ✅ Both integers and decimals work correctly
- ✅ Only logged-in users can create trees

---

## Test Flow 4: Adding Operations to Any Node

**Objective**: Verify registered users can add mathematical operations to any calculation node

### Steps:
1. Ensure you are logged in
2. Find an existing tree (or create one)
3. Locate the root node or any node in the tree
4. Click "Add Operation" button next to the node
5. Select operation type: Addition (+)
6. Enter right argument: 10
7. Submit the operation
8. Verify new child node appears under the selected node
9. Verify the result is calculated correctly (e.g., 42 + 10 = 52)

### Test All Operations:
- **Addition**: 42 + 10 = 52
- **Subtraction**: 42 - 5 = 37
- **Multiplication**: 42 * 2 = 84
- **Division**: 42 / 6 = 7

### Error Cases:
- Try division by zero → Should show error message
- Try invalid operation type → Should show error
- Try without being logged in → Should not see "Add Operation" buttons

**Expected Results**:
- ✅ All four operations work correctly
- ✅ Results are calculated accurately
- ✅ New nodes appear as children of selected node
- ✅ Division by zero is prevented
- ✅ Only logged-in users can add operations

---

## Test Flow 5: Creating Branching Discussions

**Objective**: Verify multiple operations can branch from any node

### Steps:
1. Create a new tree with starting number 100
2. Add first operation to root: 100 + 50 = 150
3. Add second operation to root: 100 - 20 = 80
4. Add third operation to root: 100 * 2 = 200
5. Verify all three branches appear under the root node
6. Select one of the child nodes (e.g., the 150 node)
7. Add operation to that child: 150 + 10 = 160
8. Add another operation to same child: 150 * 2 = 300
9. Verify the tree structure shows:
   ```
   100 (root)
   ├── 150 (100 + 50)
   │   ├── 160 (150 + 10)
   │   └── 300 (150 * 2)
   ├── 80 (100 - 20)
   └── 200 (100 * 2)
   ```

### Visual Verification:
- Verify hierarchical structure is clear
- Verify indentation shows parent-child relationships
- Verify you can expand/collapse nodes with children

**Expected Results**:
- ✅ Multiple operations can be added to same node
- ✅ Operations can be added to any node at any depth
- ✅ Tree structure is displayed hierarchically
- ✅ All branches are visible and navigable

---

## Test Flow 6: Real-Time Updates Across Browser Tabs

**Objective**: Verify WebSocket real-time updates work correctly

### Setup:
1. Open the application in two Chrome tabs (Tab A and Tab B)
2. In Tab A: Log in as user1
3. In Tab B: Log in as user2 (or stay logged out)

### Test New Tree Creation:
1. In Tab A: Create a new tree with starting number 999
2. In Tab B: Verify the new tree appears immediately without refreshing
3. Verify the tree shows user1 as the creator

### Test Operation Addition:
1. In Tab A: Add an operation to any tree (e.g., 999 + 1 = 1000)
2. In Tab B: Verify the new operation appears immediately in the tree
3. Verify the tree structure updates without page refresh

### Test Multiple Users:
1. In Tab A (user1): Create a tree with starting number 50
2. In Tab B (user2): Add operation to user1's tree (50 + 50 = 100)
3. In Tab A: Verify user2's operation appears immediately
4. Verify the operation shows user2 as the creator

### Test Reconnection:
1. Stop the server
2. Verify both tabs show connection error or loading state
3. Restart the server
4. Verify both tabs reconnect automatically
5. Verify all data is still present

**Expected Results**:
- ✅ New trees appear in all tabs immediately
- ✅ New operations appear in all tabs immediately
- ✅ No page refresh needed to see updates
- ✅ Creator usernames are shown correctly
- ✅ WebSocket reconnects after server restart

---

## Test Flow 7: Data Persistence

**Objective**: Verify all data persists across server restarts

### Steps:
1. Create several trees and operations
2. Note the current state (take a screenshot if helpful)
3. Stop the server (Ctrl+C in server terminal)
4. Restart the server (`npm run dev`)
5. Refresh the browser
6. Verify all trees are still present
7. Verify all operations are still present
8. Verify you can still log in with existing accounts
9. Create a new operation
10. Verify it persists after another restart

**Expected Results**:
- ✅ All trees persist across restarts
- ✅ All operations persist across restarts
- ✅ User accounts persist across restarts
- ✅ New data continues to persist correctly

---

## Test Flow 8: Chrome Browser Compatibility

**Objective**: Verify application works correctly in latest Chrome

### Visual Tests:
- Verify layout is responsive and looks good
- Verify forms are styled correctly
- Verify tree structure is visually clear
- Verify buttons and interactive elements work
- Verify error messages are visible and styled

### Functional Tests:
- Verify all forms submit correctly
- Verify all buttons respond to clicks
- Verify WebSocket connection works
- Verify no console errors (open DevTools → Console)
- Verify no network errors (open DevTools → Network)

### Performance Tests:
- Create a tree with 20+ operations
- Verify the tree renders without lag
- Verify scrolling is smooth
- Verify operations can still be added quickly

**Expected Results**:
- ✅ Application looks good in Chrome
- ✅ All functionality works smoothly
- ✅ No errors in console
- ✅ Good performance with many nodes

---

## Summary Checklist

After completing all manual tests, verify:

- [ ] Unregistered users can view all trees
- [ ] Registration creates new accounts
- [ ] Login works with valid credentials
- [ ] Appropriate errors shown for invalid inputs
- [ ] Logged-in users can create starting numbers
- [ ] All four operations (add, subtract, multiply, divide) work
- [ ] Division by zero is prevented
- [ ] Multiple operations can branch from same node
- [ ] Operations can be added at any depth
- [ ] Tree structure displays hierarchically
- [ ] Real-time updates work across browser tabs
- [ ] New trees appear immediately in all tabs
- [ ] New operations appear immediately in all tabs
- [ ] WebSocket reconnects after server restart
- [ ] All data persists across server restarts
- [ ] Application works well in Chrome browser
- [ ] No console or network errors

---

## Automated Test Coverage

Note: Many of these flows are also covered by automated tests in:
- `server/src/__tests__/e2e-user-flows.test.ts` (32 tests covering all API functionality)
- `server/src/__tests__/api.test.ts` (Integration tests)
- `server/src/services/__tests__/*.test.ts` (Unit tests)

Run automated tests with:
```bash
cd server
npm test
```

The manual tests above focus on browser-specific functionality, real-time WebSocket updates, and user experience that cannot be fully automated.
