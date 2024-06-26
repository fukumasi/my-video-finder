# Dockerfile
FROM node:20

# アプリケーションディレクトリの作成
WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# アプリケーションを起動
CMD ["node", "index.js"]
