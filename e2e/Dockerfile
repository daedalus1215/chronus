FROM mcr.microsoft.com/playwright:v1.42.1-focal

WORKDIR /e2e

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy test files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Command to run tests
CMD ["npx", "playwright", "test"] 