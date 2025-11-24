# Sprint 3 Project Documentation - TinyThreads

# Table of Contents

    - [Section 1: Sprint Planning & Process Improvement]
    - [Section 2: Automated Testing]
    - [Section 3: Code Quality Tools]
    - [Section 4: Code Review Process]
    - [Section 5: CI/CD Pipeline]
    - [Section 6: Burn Chart & Velocity Tracking]
    - [Section 7: SCRUM Ceremonies]
    - [Section 8: Working MVP Deliverable]

<details>
<summary><strong>Section 1: Sprint Planning & Process Improvement (20 points)</strong></summary>

# Section 1: Sprint Planning & Process Improvement

## Sprint Goal & Backlog

### Sprint Goal for Sprint 3:

"Enhance TinyThreads with user authentication, advanced listing management, and improved marketplace functionality while maintaining code quality and comprehensive documentation."

- Confirmation that the goal is documented in the GitHub Milestone ([Sprint 3 Milestone Link](https://github.com/vinaldsz/TinyThreads/milestone/3)).

- The Sprint Backlog includes all committed items with clear acceptance criteria, story points, and assigned owners. ([TinyThreads Project View](https://github.com/users/vinaldsz/projects/1))

**Sprint 3 Committed Issues (ALL COMPLETED):**

### **COMPLETED ISSUES (24/24 story points - 100% complete)**

- **Issue #39 (5 SP)** - Login and Authentication - **Assigned to: Vinal**
  - **Status**: ✅ Complete
  - **Priority**: MUST
  - **Description**: Implemented user authentication system for TinyThreads

- **Issue #3 (1 SP)** - Display hygiene and safety information for second-hand items - **Assigned to: Abhishek**
  - **Status**: ✅ Complete
  - **Priority**: MUST
  - **Description**: Added safety and hygiene guidelines for second-hand baby items

- **Issue #80 (2 SP)** - Restructure src and test folders - **Assigned to: Vinal**
  - **Status**: ✅ Complete
  - **Priority**: COULD
  - **Description**: Reorganized project structure for better maintainability

- **Issue #9 (1 SP)** - Add direct donation feature for outgrown items - **Assigned to: Abhishek**
  - **Status**: ✅ Complete
  - **Priority**: MUST
  - **Description**: Implemented donation marking feature for items instead of sales only

- **Issue #78 (5 SP)** - Documentation - Sprint 3 - **Assigned to: Xiaowei**
  - **Status**: ✅ Complete
  - **Priority**: MUST
  - **Description**: Completed comprehensive Sprint 3 documentation and evaluation

- **Issue #77 (5 SP)** - Transaction Feature for Listings - **Assigned to: Xiaowei**
  - **Status**: ✅ Complete
  - **Priority**: MUST
  - **Description**: Implemented transaction handling and tracking for marketplace listings

- **Issue #79 (1 SP)** - Modify CI/CD to include Prettier formatting - **Assigned to: Vinal**
  - **Status**: ✅ Complete
  - **Priority**: SHOULD
  - **Description**: Enhanced CI/CD pipeline with automated code formatting

- **Issue #18 (2 SP)** - Edit or delete the listings to update information or remove old items - **Assigned to: Abhishek**
  - **Status**: ✅ Complete
  - **Priority**: SHOULD
  - **Description**: Implemented listing management features for users

**Total Sprint 3 Commitment: 24 Story Points (100% COMPLETED)**

## Process Improvement Plan

### Sprint 2 Retrospective Analysis

1. **Meeting Details:**
   - Date: [11-11-2025]
   - Present: Vinal Dalcy Dsouza, Abhishek Tuteja, Xiaowei Qi
   - **Sprint 2 Results:**
     - Planned story points: 24
     - Completed story points: 24
     - Velocity: 100%

2. **What Went Well in Sprint 2:**
   - All Sprint 2 issues completed and deployed to production
   - CI/CD pipeline reduced manual effort and improved confidence
   - Improved collaboration and communication
   - Professional branding with logo and About page
   - Form validations and real production data

3. **What Could Have Been Better in Sprint 2:**
   - Test maintenance overhead
   - Merge conflicts from parallel work across multiple branches
   - Dev environment clarity - no dedicated dev deployment URL

4. **Sprint 2 → Sprint 3 Improvements Implemented:**
   - Test Maintenance Overhead: Issue #80 restructured src and test folders for better organization and reduced maintenance complexity
   - Merge Conflicts: Issue #79 added Prettier to CI/CD pipeline for consistent formatting; implemented smaller PRs with clear team ownership
   - Dev Environment: Maintained separate dev/prod databases established in Sprint 2; applied proper environment separation to new authentication and transaction features
   - Process Refinements: Used Sprint 2's 100% success rate to calibrate Sprint 3 estimates; planned documentation (Issue #78) from sprint start rather than as afterthought

### Ticket Quality Improvements for Sprint 3

1. **Improving Ticket Granularity:**
   - Complex features like authentication (#39, 5 SP) and transactions (#77, 5 SP) were properly scoped as substantial tasks
   - Smaller operational tasks like donations (#9, 1 SP) and CI/CD improvements (#79, 1 SP) were kept lightweight
   - Documentation (#78, 5 SP) was allocated appropriate effort reflecting its comprehensive scope

2. **Enhanced Acceptance Criteria Format:**
   - All Sprint 3 issues included clear definition of done with specific deliverables
   - Priority classification (MUST/SHOULD/COULD) provided clear scope guidance
   - Each issue linked to user value and technical requirements

3. **Better Estimation Practices:**
   - Used Sprint 2's 100% completion velocity data to calibrate Sprint 3 estimates
   - Applied planning poker approach with team consensus on complex items
   - Resulted in accurate 24-point commitment with 100% delivery

4. **Specific Actions and Ownership:**
   - **Vinal:**
   - [Login and Authentication]
   - [Restructure src and test folders]
   - [Modify CI/CD to include Prettier formatting]
   - **Abhishek:**
   - [Display hygiene and safety information for second-hand items]
   - [Add direct donation feature for outgrown items]
   - **Xiaowei:**
   - [Transaction Feature for Listings]
   - [Documentation - Sprint 3]

### Sprint 3 Capacity Planning

1. **Realistic Commitment:**  
   For Sprint 3, the team committed to **24 story points** distributed across 9 issues, all of which were successfully completed.
   - **Vinal:** Issues #39, #87, #79, #80
   - **Abhishek:** Issues #9, #3, #18
   - **Xiaowei:** Issues #77, #78

   **Sprint Success:** The team completed 100% of committed scope, demonstrating excellent estimation and execution capabilities.

2. **Team Availability:**  
   All three team members — **Vinal Dalcy Dsouza**, **Abhishek Tuteja**, and **Xiaowei Qi** — were fully available throughout Sprint 3 with optimal workload distribution.

3. **Sprint 3 Achievements:**
   - Successfully delivered all MUST-have features (authentication, safety info, donations, transactions, documentation)
   - Completed important SHOULD-have features (listing management, CI/CD improvements)
   - Delivered COULD-have improvements (code restructuring)
   - Maintained high velocity of 22 story points with 100% completion rate

# End of Section 1

</details>

<details>
<summary><strong>Section 2: Automated Testing (15 points)</strong></summary>

# Section 2: Automated Testing

## Test Coverage & Quality

### Code Coverage

- We continue using **Jest** as our test runner with coverage via:

  ```bash
  npm test -- --coverage
  ```

- Latest coverage run (Sprint 3) shows:
  - **All files**:
    - **Statements:** 80.02%
    - **Branches:** 74.62%
    - **Functions:** 92.54%
    - **Lines:** 81.18%

  This exceeds the required **70% minimum coverage**.

- **Coverage Improvements from Sprint 2:**
  - Sprint 2 Coverage: 77.06% statements, 75.17% branches
  - Sprint 3 Coverage: 80.02% statements, 74.62% branches

### Test Types Implemented

#### Unit Tests

- Authentication System Tests:

1. tests/unit/app/Items/[id]/login.test.js – validates login form submission, error handling, and authentication state management
2. tests/unit/app/Items/[id]/signup.test.js – tests user registration validation, password requirements, and account creation flow
3. tests/unit/components/Navbar.auth.test.js – verifies authenticated vs unauthenticated navbar states and user menu functionality

- Transaction Feature Tests:

1. tests/unit/app/api/transactions/create/route.test.js – tests transaction API endpoints, payment validation, and database integration
2. tests/unit/components/PurchaseModal.test.js – validates transaction modal UI, form handling, and payment flow

- Enhanced Component Tests:

1. tests/unit/components/ItemCard.extra.test.js – tests new donation toggle, enhanced item actions, and improved card interactions
2. tests/unit/components/Providers.test.js – validates context providers for authentication and transaction state management

#### Integration Tests

Sprint 3 integration tests focus on feature interactions and data flow:

Authentication Integration:

- Login → Navigation state changes → Protected route access
  User registration → Email verification → Profile setup workflow
- Authentication persistence across page refreshes and navigation

Transaction System Integration:

- Item selection → Transaction modal → Payment processing → Order confirmation
- User authentication verification during purchase flow
  Transaction history integration with user profiles

API Data Flow Testing:

- tests/unit/app/api/items/[id]/route.test.js – tests item retrieval with authentication context
- tests/unit/app/api/items/route.test.js – validates filtered item queries and user-specific results

#### End-to-End Tests

Sprint 3 maintained manual E2E validation for critical user journeys

### Test Quality

#### Acceptance Criteria Driven

- Authentication tests validate login/signup requirements from Issue #39
- Transaction tests verify payment processing requirements from Issue #77
- Listing management tests confirm edit/delete functionality from Issue #18
- All Sprint 3 features include corresponding test coverage for acceptance criteria

#### Edge Cases Covered

- Authentication: Invalid credentials, expired tokens, network failures
- Listing management: Unauthorized access attempts, data validation errors
- API endpoints: Malformed requests, database connection failures

#### Reliability (Non-Flaky Tests)

- Current test results: Test Suites: X passed, X total and Tests: X passed, X total

## Testing Framework & Execution

### Testing Framework Configuration

- Framework: Continued use of Jest for consistency with Sprint 2 foundation
- Configuration: Maintained jest.config.mjs with enhanced settings for Sprint 3 features
- Dependencies: All testing packages updated in package.json to support new feature testing

### Test Execution

npm run test # Runs all tests
npm run test -- --coverage # Runs tests with coverage report

# End of Section 2

</details>

<details>
<summary><strong>Section 3: Code Quality Tools (15 points)</strong></summary>

# Section 3: Code Quality Tools

## ESLint Configuration

- Framework Continuity: Maintained ESLint configuration from Sprint 2 with Next.js Core Web Vitals rules via eslint-config-next/core-web-vitals
- Configuration File: eslint.config.mjs continues to use Next.js and TypeScript support through eslint-config-next/typescript
- Rule Coverage: ESLint enforces both style consistency and bug detection including unused variables, React/Next.js best practices, and code quality standards
- Sprint 3 Status: Zero ESLint errors or warnings across the entire codebase
- Team Compliance: All Sprint 3 features (authentication, transactions, listing management) pass linting requirements
- Script Integration: npm run lint executes successfully and is integrated into CI/CD pipeline

## Prettier Configuration

- Sprint 3 Implementation: Successfully added Prettier configuration as part of Issue #79 - Modify CI/CD to include Prettier formatting
- Configuration: .prettierrc file implemented with standardized formatting rules for consistent code style
- Team Integration: npm run format command available for automatic code formatting
- ESLint Compatibility: Prettier configured to work alongside ESLint without conflicts
- CI/CD Integration: Prettier formatting checks integrated into continuous integration pipeline
- Codebase Consistency: All Sprint 3 code formatted according to shared Prettier standards

## Code Quality Evidence

- Working Scripts: All quality assurance commands function properly:
- Zero Issues: Current codebase has 0 ESLint errors and 0 warnings, demonstrating consistent code quality maintenance
- Process Integration: Code quality tools integrated into development workflow and CI/CD pipeline
- Team Adoption: All team members successfully using both ESLint and Prettier for Sprint 3 development

# End of Section 3

</details>

<details>
<summary><strong>Section 4: Code Review Process (15 points)</strong></summary>

# Section 4: Code Review Process

## Branching Strategy

### Branch Structure (Continued from Sprint 2)

- **`main` branch** — Production-ready code only
- **`develop` branch** — Stable integration branch
- **Feature branches (`feature/*`)** — Per issue/user story
- **Fix branches (`fix/*`)** — Bug fixes
- **Documentation branches (`docs/*`)** — Documentation updates

## Branch Protection Rules

### Maintained Rules for `main`:

- ✔ Require pull request before merging
- ✔ Require at least 1 approval before merging
- ✔ Direct commits blocked
- ✔ CI must pass before merging

**Evidence Screenshot:** [Include updated screenshot if rules changed]

## Pull Request & Review Process

### Sprint 3 PR Summary

All Sprint 3 issues were closed via Pull Requests[https://github.com/vinaldsz/TinyThreads/pulls?q=is%3Apr+is%3Aclosed]

### Automated Review Enforcement

- All PRs triggered automated checks
- CI status verified before merge approval

# End of Section 4

</details>

<details>
<summary><strong>Section 5: CI/CD Pipeline (15 points)</strong></summary>

# Section 5: CI/CD Pipeline

## Continuous Integration Setup

### CI Workflow Status (Sprint 3)

- GitHub Actions Implementation: Maintained robust CI pipeline with Sprint 3 enhancements visible in workflow execution
- Pipeline Configuration: .github/workflows/CI.yml successfully processes all Pull Requests and main branch commits
- Execution Success: Recent run shows successful completion in 45 seconds with all steps passing

### CI Pipeline Steps (Current)

- Set up job (1s) - Environment initialization
  Checkout repository (1s) - Source code retrieval
- Use Node.js 18.x (4s) - Runtime environment setup
- Install dependencies (16s) - Package installation and caching
- Run ESLint (5s) - Code quality and style validation
- Check formatting with Prettier (3s) - NEW in Sprint 3 - Automated formatting validation from Issue #79
- Run tests with coverage (12s) - Jest test execution with coverage reporting
- Verify coverage threshold (70% lines) (0s) - Coverage validation passes
- Complete job (0s) - Successful pipeline completion

### CI Performance in Sprint 3

- Total PRs processed: 10
- CI success rate: 100%

## Continuous Deployment Setup

### Production Deployment Status

- Platform: Vercel continues as deployment platform
- Production URL: https://tiny-threads-ten.vercel.app
- Deployment Trigger: Automatic deployment on successful merge to main branch
- Sprint 3 Features: All completed features (authentication, transactions, listing management) deployed and accessible

# End of Section 5

</details>

<details>
<summary><strong>Section 6: Burn Chart & Velocity Tracking (10 points)</strong></summary>

# Section 6: Burn Chart & Velocity Tracking (10 points)

## Burn Chart Implementation (6 points)

Sprint 3 progress was tracked using a **burndown chart** [Sprint 3 Burndown Analysis](burn_chart/sprint3_burndown.md)

- **Burndown chart image:** [Sprint 3 burndown chart](burn_chart/sprint3_burndown_chart.png)

# End of Section 6

</details>

<details>
<summary><strong>Section 7: SCRUM Ceremonies (20 points)</strong></summary>

# Section 7: SCRUM Ceremonies (20 points)

## Daily Standups (5 points)

Daily standups for Sprint 3 recorded in: `docs/Sprint-3/burn_chart/standup_logs.md`

### Blockers Noted

- Test coverage
- CI/CD auto check fail

These blockers were addressed via increased coordination, smaller PRs, and clearer division of work across feature branches.

## Sprint Review with Product Owner (8 points)

### Sprint Review Session Details

- **Attendees:** Vinal Dalcy Dsouza/Abhishek Tuteja/Xiaowei Qi
- **Format:** In class review

### Demonstrated Features

Sprint 3 features demonstrated in production (`https://tiny-threads-ten.vercel.app`):

- Complete purchase with order confirmation
- Add Direct Donation Feature for Outgrown Items
- Login and Authentication
- Users Should Be Able to See Seller Information in the Listing
- User friendly Design

## Sprint Retrospective (7 points)

### Velocity Analysis

- **Sprint 1 Velocity:** 20 story points completed (100%)
- **Sprint 2 Velocity:** 25 story points completed (100%)
- **Sprint 3 Velocity:** 24 story points completed (100%)

**Sprint Progression Analysis:**

- **Consistent 100% completion rate** across all three sprints demonstrates excellent planning and execution
- **Velocity trend:** 20 → 25 → 24 points shows stable capacity with slight adjustment in Sprint 3
- **Total story points delivered:** 69 points across three sprints
- **Perfect estimation accuracy:** Team consistently delivers exactly what they commit to

**Sprint 3 Specific Success:**
The slight reduction from 25 to 24 points in Sprint 3 proved optimal, allowing the team to:

- Deliver higher-complexity features (authentication, transactions)
- Maintain code quality standards
- Complete comprehensive documentation
- Achieve 100% scope completion without overtime or stress

### Process Retrospective

#### What Went Well (Celebrate Wins!)

- All Sprint 3 issues were completed and deployed to production
- The CI/CD pipeline reduced manual effort and improved the merge
- The new page design is more user friendly
- The feature we added make the website more functional

#### What Could Be Better

- Writing test and do lint and format check every time before we create a PR
- When implementation details changed, tests often needed to be updated, which slowed down some features.

#### Specific Improvements for Sprint 4

| Improvement              | Description                                                                             | Owner    | Target Implementation |
| ------------------------ | --------------------------------------------------------------------------------------- | -------- | --------------------- | ---------------------- |
| Enhanced UX              | Improve responsive design                                                               | Abhishek | Team                  | Next development cycle |
| Automated E2E Testing    | Implement Cypress or Playwright for automated end-to-end testing of critical user flows | Team     | Next sprint planning  |
| Performance Optimization | Optimize image loading and API response times for better user experience                | Team     | Ongoing improvement   |
| Enhanced Security        | Implement additional security measures for payment processing and user data             | Team     | Security review cycle |

### New Practices Evaluation

#### Testing Evolution:

- Coverage Growth: Expanded coverage to include comprehensive testing for authentication, transactions, and API endpoints
- Feature-Specific Testing: Developed robust mocking strategies for complex features like user authentication and payment processing
- Test Efficiency: Improved test execution speed while maintaining comprehensive coverage of business-critical functionality

#### CI/CD Maturity:

- Pipeline Enhancement: Successfully integrated Prettier formatting checks , creating a more comprehensive quality gate
- Execution Speed: Optimized CI pipeline to complete in 45 seconds with all quality checks (lint, format, test, coverage)
- Quality Gates: Automated coverage threshold validation (70%+) prevents regression and maintains code quality standards

#### Code Review Process:

- Review Quality: Enhanced focus on complex PRs with substantive feedback for authentication and transaction features.
- Team Collaboration: Improved coordination through clear feature ownership reducing merge conflicts.
- Team used the checklist to do the code review. More clear and structured.

# End of Section 7

</details>

<details>
<summary><strong>Section 8: Working MVP Deliverable (10 points)</strong></summary>

# Section 8: Working MVP Deliverable (10 points)

## Enhanced MVP (5 points)

### Sprint 3 Features Delivered and Working

The Sprint 3 MVP is fully deployed to production at:

- **https://tiny-threads-ten.vercel.app**

**Sprint 3 Feature Additions:**

- Complete Authentication System (#39): Full user registration, secure login/logout, session management, and user profile functionality implemented
- Transaction Processing (#77): End-to-end transaction system with payment handling, order processing, and confirmation workflows developed
- Enhanced Seller Visibility (#87): Users can now view detailed seller information within listings, improving trust and communication
- Donation Features (#9): Toggle option enabling users to mark items as donations, expanding marketplace beyond sales-only model created
- Safety Information Display (#3): Prominent hygiene and safety guidelines for second-hand baby items, enhancing user trust and safety implemented
- Code Quality Enhancements (#79, #80): Improved project structure and automated Prettier formatting integration in CI/CD pipeline managed
- Edit or delete the listings to update information or remove old items(#18)

## Technical Excellence (5 points)

### Production-Ready Quality

**Reliability:**

- Zero downtime - Specific uptime commitment
- Error resilience - Comprehensive error handling across all features
- Data integrity - Database consistency for users, transactions, listings
- Recovery mechanisms - Automatic recovery and graceful degradation

**Performance:**

- Authentication speed - Specific 2-3 second performance targets
- Transaction efficiency - Real-time status updates and confirmation
- API responsiveness - Sub-second loading time optimization
- Resource optimization - Efficient memory and server usage

**User Experience:**

- Intuitive interface - Clear navigation for all major features
- Visual feedback - Comprehensive user action confirmation
- Accessibility - Professional UI design standards

### Independent Access Verification

- **Production URL:** https://tiny-threads-ten.vercel.app
- No installation or local setup required.
- All backend resources (MongoDB Atlas, AWS S3) fully configured.

# End of Section 8

</details>

---
