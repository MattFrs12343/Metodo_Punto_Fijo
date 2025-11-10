# Implementation Plan

- [x] 1. Set up project structure and configuration files


  - Create root directory structure with react/ and streamlit/ folders
  - Create docker-compose.yml in root with service definitions for both applications
  - _Requirements: 7.1, 8.1, 8.2_



- [x] 2. Initialize React application with TypeScript and Vite
  - Create package.json with dependencies: react, react-dom, typescript, vite, tailwind, mathjs
  - Create tsconfig.json with strict TypeScript configuration
  - Create vite.config.ts with development server settings
  - Create tailwind.config.js and postcss.config.js for styling
  - Create index.html as entry point
  - Create src/main.tsx to bootstrap React application


  - Create src/index.css with Tailwind directives
  - _Requirements: 1.1, 8.2, 8.4, 9.1_

- [x] 3. Implement core fixed point algorithm in TypeScript
  - Create src/lib/fixedPoint.ts with TypeScript interfaces for FixedPointOptions, FixedPointResult, and IterationResult
  - Implement fixedPointIteration function that compiles g(x) using mathjs
  - Implement iteration loop with error calculation based on stop criterion (delta or residual)
  - Implement aitkenAcceleration function for Δ² acceleration
  - Add error handling for function parsing and evaluation errors
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.1, 10.2_



- [ ]* 3.1 Write unit tests for fixedPoint.ts
  - Create test file with Vitest for convergent cases (cos(x)), divergent cases, Aitken acceleration, and edge cases
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 4. Create main React App component
  - Create src/App.tsx with state management for function, parameters, results, and errors

  - Implement form UI with Tailwind CSS for inputting g(x), x₀, tolerance, max iterations, stop criterion, and Aitken option
  - Implement calculate button handler that calls fixedPointIteration
  - Implement results display section showing final value, error, and iteration count
  - Add error message display with appropriate styling
  - Add loading state during calculation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 10.3, 10.5_



- [x] 5. Implement results table component
  - Add table rendering in App.tsx to display iteration results (n, xₙ, g(xₙ), error)
  - Style table with Tailwind CSS for readability
  - Add conditional column for Aitken values when enabled
  - Implement scroll or pagination for large result sets
  - _Requirements: 1.5, 6.1, 6.2, 6.3, 6.4_



- [x] 6. Create cobweb canvas visualization component
  - Create src/components/CobwebCanvas.tsx with props interface for gFunction and iterations
  - Implement canvas setup with proper dimensions and context
  - Implement axis drawing with labels and grid
  - Implement function plotting for g(x) by evaluating at multiple points


  - Implement y = x line plotting
  - Implement cobweb pattern drawing with alternating vertical and horizontal lines
  - Add automatic range calculation based on iteration values

  - _Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Create React Dockerfile and configure for development
  - Create react/Dockerfile with node:18-alpine base image
  - Configure WORKDIR, COPY package files, RUN npm install
  - COPY source code and EXPOSE port 5173
  - Set CMD to run Vite dev server with --host flag

  - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.2_

- [x] 8. Initialize Streamlit application structure
  - Create streamlit/requirements.txt with streamlit, numpy, and other dependencies
  - Create streamlit/app.py with basic Streamlit imports and structure
  - _Requirements: 2.1, 2.2, 9.3_


- [x] 9. Implement fixed point algorithm in Python
  - Create parse_function in app.py with safe eval using restricted namespace
  - Implement fixed_point_iteration function with numpy calculations
  - Implement iteration loop with error calculation for both criteria
  - Implement aitken_acceleration function in Python


  - Add error handling with try-except blocks for parsing and evaluation
  - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.1, 10.2_

- [x] 10. Create Streamlit UI with parameter controls
  - Implement main() function with st.title for app header
  - Create sidebar with st.sidebar containing input widgets for g(x), x₀, tolerance, max iterations, criterion, and Aitken checkbox

  - Implement calculate button with st.button
  - Add input validation and error display with st.error
  - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5, 10.3_

- [x] 11. Implement Streamlit results display


  - Add results section that displays final value, error, and iteration count using st.metric or st.write
  - Create DataFrame from iteration results and display with st.dataframe
  - Add conditional columns for Aitken values
  - Style table for readability
  - _Requirements: 2.3, 6.1, 6.2, 6.3, 6.4_


- [x] 12. Create advanced HTML visualization file
  - Create streamlit/fixed_point_demo_sigfmt.html with HTML structure
  - Add canvas or SVG element for plotting
  - Implement JavaScript for cobweb plot rendering
  - Add CSS styling for visual appeal

  - Implement interactive features (zoom, pan, tooltips)
  - _Requirements: 2.1, 2.4, 5.1, 5.2, 5.3, 5.4_

- [x] 13. Integrate HTML visualization into Streamlit app
  - Add file reading logic in app.py to load fixed_point_demo_sigfmt.html
  - Use st.components.v1.html to embed HTML content with appropriate height
  - Pass iteration data to HTML via JavaScript injection or data attributes


  - _Requirements: 2.4_

- [x] 14. Create Streamlit Dockerfile
  - Create streamlit/Dockerfile with python:3.11-slim base image
  - Configure WORKDIR, COPY requirements.txt, RUN pip install
  - COPY source files and EXPOSE port 8501



  - Set CMD to run streamlit with --server.address=0.0.0.0
  - _Requirements: 7.1, 7.2, 9.3, 9.4_

- [x] 15. Configure Docker Compose orchestration
  - Update docker-compose.yml with react service configuration (build context, ports, volumes, environment)
  - Add streamlit service configuration with similar structure
  - Configure volume mounts for hot reload in development
  - Set appropriate environment variables for both services
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 16. Add comprehensive error handling and validation
  - Enhance React error handling with specific error types and user-friendly messages
  - Enhance Streamlit error handling with st.error and st.warning
  - Add input validation for all numeric parameters (range checks)
  - Add function syntax validation before execution
  - Implement convergence failure handling with partial results display
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 17. Create README documentation
  - Create README.md in root with project description and architecture overview
  - Document installation instructions for both Docker and local setup
  - Add usage instructions with parameter descriptions
  - Include example functions and expected results
  - Add troubleshooting section
  - _Requirements: 7.1, 9.1, 9.2, 9.3, 9.4_

- [x] 18. Test and verify complete system integration
  - Build and start both containers with docker compose up --build
  - Verify React app accessibility at localhost:5173
  - Verify Streamlit app accessibility at localhost:8501
  - Test convergent case (e.g., g(x) = cos(x), x₀ = 0.5) in both apps
  - Test divergent case in both apps
  - Test Aitken acceleration in both apps
  - Test error handling with invalid functions
  - Verify cobweb plots render correctly in both apps
  - Test hot reload by modifying source files
  - _Requirements: 1.7, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_
