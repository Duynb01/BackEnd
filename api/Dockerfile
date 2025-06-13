# Base image
FROM node:22.16.0

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy trước package.json để cache install
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ project
COPY . .


# Cổng mặc định NestJS chạy
EXPOSE 3000

# Lệnh mặc định khi container khởi chạy
CMD ["npm", "run", "start:dev"]
