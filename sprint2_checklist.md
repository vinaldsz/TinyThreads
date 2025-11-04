# Sprint 2 Complete Work Checklist

## PHASE 1: Sprint Planning & Setup

### Sprint Planning
- [ ] Create Sprint 2 Milestone in GitHub with goal
- [ ] Write Sprint 1 Retrospective document
- [ ] Calculate Sprint 1 velocity
- [ ] List what worked well and what didn't
- [ ] Create action items for improvements
- [ ] Document team capacity for Sprint 2
- [ ] Create GitHub Issues for all features (with acceptance criteria and story points)
- [ ] Add all issues to GitHub Projects Sprint 2 board

### Testing Setup
- [ ] Install Jest or Vitest testing framework
- [ ] Create testing configuration file
- [ ] Add test script to package.json
- [ ] Document testing approach in README

### Code Quality Tools
- [ ] Install ESLint
- [ ] Create ESLint configuration file
- [ ] Configure style rules
- [ ] Install Prettier
- [ ] Create Prettier configuration file
- [ ] Run Prettier on entire codebase to format all files
- [ ] Add lint and format scripts to package.json
- [ ] Fix all existing ESLint errors and warnings

### Branching Strategy
- [ ] Create development branch from main
- [ ] Setup branch protection rules on main branch
- [ ] Configure to require PR approval before merge
- [ ] Configure to require CI checks to pass
- [ ] Block direct commits to main
- [ ] Document branching strategy in README

### CI/CD Pipeline
- [ ] Create GitHub Actions workflow for CI
- [ ] Configure CI to run on Pull Requests
- [ ] Add steps: install dependencies, run lint, run tests, build app
- [ ] Setup automatic deployment to Vercel on merge to main
- [ ] Test CI pipeline with dummy PR
- [ ] Document deployment process in README

### Burn Chart
- [ ] Setup GitHub Projects Insights for Sprint 2
- [ ] OR create manual tracking spreadsheet with daily updates
- [ ] Document how to update burn chart daily

---

## PHASE 2: Feature Development

### FEATURE 1: Authentication

#### Backend Work
- [ ] Create User model in MongoDB with email, password, name, location fields
- [ ] Install JWT and bcrypt packages
- [ ] Create register endpoint
- [ ] Create login endpoint
- [ ] Create get profile endpoint (protected)
- [ ] Create authentication middleware for protected routes
- [ ] Write backend tests for all auth endpoints
- [ ] Test endpoints with Postman or similar tool

#### Frontend Work
- [ ] Create Register page with form
- [ ] Add email, password, name, location inputs
- [ ] Implement location input with address geocoding
- [ ] Create Login page with form
- [ ] Setup JWT token storage
- [ ] Create AuthContext for managing user state
- [ ] Create protected route wrapper component
- [ ] Add logout functionality
- [ ] Add Login/Logout buttons to navigation
- [ ] Write frontend tests for auth components

#### Code Review
- [ ] Create feature branch for authentication
- [ ] Create Pull Request to development branch
- [ ] Review code using code review checklist
- [ ] Leave constructive comments on PR
- [ ] Fix any issues from review
- [ ] Merge PR after CI passes

---

### FEATURE 2: Map View

#### Backend Work
- [ ] Update Listing model to include location (address, latitude, longitude)
- [ ] Create endpoint to get nearby listings
- [ ] Add query parameters for latitude, longitude, radius
- [ ] Implement distance calculation logic
- [ ] Write backend tests for distance filtering
- [ ] Test endpoint returns correct listings within radius

#### Frontend Work
- [ ] Install Mapbox GL JS or Google Maps package
- [ ] Create MapView component
- [ ] Display map centered on user's location
- [ ] Add markers for all listings on map
- [ ] Make markers show item thumbnail, title, and price in popup
- [ ] Create distance filter dropdown (5, 10, 20 miles options)
- [ ] Add "Center on my location" button
- [ ] Integrate map into browse page
- [ ] Make markers clickable to navigate to item detail page
- [ ] Write frontend tests for map component
- [ ] Test map displays correctly
- [ ] Test filtering by distance works

#### Code Review
- [ ] Create feature branch for map view
- [ ] Create Pull Request to development branch
- [ ] Review code using code review checklist
- [ ] Leave constructive comments on PR
- [ ] Fix any issues from review
- [ ] Merge PR after CI passes

---

### FEATURE 3: Transaction Flow

#### Backend Work
- [ ] Create Transaction model with buyer, seller, item, status fields
- [ ] Create endpoint to create new transaction
- [ ] Create endpoint to get seller's transactions
- [ ] Create endpoint to mark transaction as completed
- [ ] Write backend tests for all transaction endpoints
- [ ] Test transaction creation and status updates

#### Frontend Work
- [ ] Add "Contact Seller" button to item detail page
- [ ] Create transaction when button is clicked
- [ ] Display seller's contact information to buyer
- [ ] Create Seller Dashboard page
- [ ] Display list of pending transactions for seller
- [ ] Add "Mark as Completed" button for each transaction
- [ ] Show transaction status indicator
- [ ] Write frontend tests for transaction flow
- [ ] Test complete transaction user journey

#### Code Review
- [ ] Create feature branch for transactions
- [ ] Create Pull Request to development branch
- [ ] Review code using code review checklist
- [ ] Leave constructive comments on PR
- [ ] Fix any issues from review
- [ ] Merge PR after CI passes

---

## PHASE 3: Testing & Quality Assurance

### Test Coverage
- [ ] Write unit tests for authentication logic
- [ ] Write unit tests for distance calculation
- [ ] Write unit tests for transaction status changes
- [ ] Write integration tests for API endpoints
- [ ] Write integration tests for database operations
- [ ] Write end-to-end test for complete user journey
- [ ] Run coverage report
- [ ] Verify coverage is at least 70%
- [ ] Screenshot coverage report for documentation

### Final Code Quality Check
- [ ] Run lint command and fix any errors
- [ ] Run format command on all files
- [ ] Remove all commented-out code
- [ ] Add comments explaining complex logic
- [ ] Verify all Pull Requests have detailed reviews
- [ ] Check all PRs have at least 2-3 meaningful comments

---

## PHASE 4: Integration & Deployment

### Integration
- [ ] Merge all feature branches to development branch
- [ ] Test complete user flow on development
- [ ] Fix any integration bugs
- [ ] Verify all CI checks pass on development

### Production Deployment
- [ ] Create Pull Request from development to main
- [ ] Complete final code review
- [ ] Merge to main branch
- [ ] Verify automatic deployment triggers
- [ ] Test production URL works correctly
- [ ] Test all features work in production
- [ ] Update README with production URL

---

## PHASE 5: Sprint Ceremonies & Documentation

### Daily Standups
- [ ] Write standup log #1 (early in sprint)
- [ ] Write standup log #2 (mid-sprint)
- [ ] Write standup log #3 (late in sprint)
- [ ] Each log includes what team members completed
- [ ] Each log references specific GitHub issue numbers
- [ ] Each log mentions any blockers

### Sprint Review
- [ ] Schedule demo meeting with professor
- [ ] Prepare demo script
- [ ] Demo Sprint 2 goals and features
- [ ] Show live working application
- [ ] Demonstrate authentication flow
- [ ] Demonstrate map view and filtering
- [ ] Demonstrate transaction creation
- [ ] Show engineering improvements (tests, CI/CD)
- [ ] Capture professor's feedback
- [ ] Document feedback in Sprint Review notes

### Sprint Retrospective
- [ ] Calculate Sprint 2 velocity (story points completed)
- [ ] Compare Sprint 1 vs Sprint 2 velocity
- [ ] Discuss what went well
- [ ] Discuss what could be better
- [ ] Evaluate new practices (testing, CI/CD, code reviews)
- [ ] Create action items for Sprint 3
- [ ] Assign owners to each action item
- [ ] Document everything in retrospective file

### Documentation
- [ ] Update README with Sprint 2 features
- [ ] Add setup instructions for new features
- [ ] Add testing instructions
- [ ] Add linting instructions
- [ ] Add deployment information
- [ ] Link to GitHub Projects board
- [ ] Add live production URL
- [ ] Document branching strategy
- [ ] Document CI/CD pipeline
- [ ] Document testing strategy
- [ ] Document API endpoints

---

## FINAL VERIFICATION CHECKLIST

### Required Files Present
- [ ] .eslintrc.js or eslint.config.js file exists
- [ ] .prettierrc or prettier.config.js file exists
- [ ] jest.config.js or testing config file exists
- [ ] .github/workflows/ci.yml file exists
- [ ] Test files exist (*.test.js or *.spec.js)

### GitHub Configuration
- [ ] Sprint 2 Milestone exists with clear goal
- [ ] GitHub Projects board has Sprint 2 iteration
- [ ] Branch protection rules configured on main
- [ ] At least 5 Pull Requests created
- [ ] All PRs have substantive code reviews (2-3+ comments each)
- [ ] All PRs show passing CI checks

### Code Quality Verification
- [ ] Run "npm run lint" - passes with 0 errors
- [ ] Run "npm run test" - shows at least 70% coverage
- [ ] Run "npm run build" - builds successfully
- [ ] All code formatted with Prettier
- [ ] No commented-out code in main/development branches

### Sprint Deliverables
- [ ] Process improvement plan documented
- [ ] Burn chart created and updated
- [ ] Minimum 3 standup logs completed
- [ ] Sprint Review notes with professor feedback
- [ ] Sprint Retrospective with velocity analysis
- [ ] Live deployment URL accessible
- [ ] All Sprint 2 features working in production

---

## Self-Test Before Submission

1. Clone your repository fresh in new folder
2. Run npm install
3. Run npm run lint (should pass)
4. Run npm run test (should show ≥70% coverage)
5. Run npm run build (should succeed)
6. Visit GitHub Actions tab (verify workflows passed)
7. Test production URL (verify all features work)
8. Review GitHub Projects board (verify all issues updated)
9. Check all PRs have reviews with meaningful comments
10. Verify README has all required documentation